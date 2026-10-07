"use server";

import { revalidatePath } from "next/cache";
import { getCase } from "../cases";
import { ATTACHMENT_BUCKET, MAX_ATTACHMENTS, extensionByMime, imageRule } from "../media/config";
import { ImageValidationError, readImageSize, sanitizeImage, type SanitizedImage } from "../media/sanitize";
import { categories, type CategorySlug } from "../site";
import { createClient } from "../supabase/server";
import type { CommentFormState } from "./types";
import { BODY_MAX, BODY_MIN, findProhibitedContent, isValidHttpUrl } from "./validation";

const MAX_MB = imageRule.maxBytes / 1024 / 1024;

/**
 * 添付画像を検証し、メタデータを除去する。
 * 宣言された MIME タイプ・拡張子・ファイル名は使わず、ファイルの中身で形式を判定する。
 */
async function prepareImages(files: File[]): Promise<{ images: SanitizedImage[] } | { error: string }> {
  if (files.length > MAX_ATTACHMENTS) return { error: `画像は${MAX_ATTACHMENTS}枚までです。` };

  const images: SanitizedImage[] = [];
  for (const [index, file] of files.entries()) {
    const label = `${index + 1}枚目の画像`;
    if (file.size > imageRule.maxBytes) return { error: `${label}が${MAX_MB}MBを超えています。` };
    try {
      const image = sanitizeImage(new Uint8Array(await file.arrayBuffer()));
      if (image.bytes.length === 0 || image.bytes.length > imageRule.maxBytes) {
        return { error: `${label}のサイズが正しくありません。` };
      }
      images.push(image);
    } catch (e) {
      if (e instanceof ImageValidationError) {
        return { error: `${label}は対応していない形式か、壊れたファイルです（${imageRule.label}のみ）。` };
      }
      throw e;
    }
  }
  return { images };
}

export async function postComment(_prev: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const category = String(formData.get("category") ?? "") as CategorySlug;
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const infoCheckedAt = String(formData.get("infoCheckedAt") ?? "").trim();
  const agreed = formData.get("agreement") === "on";
  const files = formData.getAll("images").filter((v): v is File => v instanceof File && v.size > 0);
  const values = { body, sourceUrl, infoCheckedAt };

  if (!categories.some((c) => c.slug === category) || !(await getCase(category, slug))) {
    return { ok: false, message: "投稿先のページが見つかりません。" };
  }

  const errors: CommentFormState["errors"] = {};
  // 本文は必須（画像だけの投稿は不可）
  if (body.length < BODY_MIN || body.length > BODY_MAX) {
    errors.body = `本文は${BODY_MIN}〜${BODY_MAX}文字で入力してください（画像だけの投稿はできません）。`;
  } else {
    const prohibited = findProhibitedContent(body);
    if (prohibited) errors.body = prohibited;
  }
  if (sourceUrl && !isValidHttpUrl(sourceUrl)) {
    errors.sourceUrl = "http:// または https:// で始まるURLを入力してください。";
  }
  // datetime-local（タイムゾーンなし）は日本時間として扱う
  const checkedAt = infoCheckedAt ? new Date(`${infoCheckedAt}:00+09:00`) : null;
  if (checkedAt && (Number.isNaN(checkedAt.getTime()) || checkedAt.getTime() > Date.now() + 60_000)) {
    errors.infoCheckedAt = "確認日時が正しくありません（未来の日時は入力できません）。";
  }
  if (!agreed) {
    errors.agreement = "投稿ルールへの同意が必要です。";
  }

  const prepared = await prepareImages(files);
  if ("error" in prepared) errors.images = prepared.error;

  if (Object.keys(errors).length > 0 || "error" in prepared) {
    return { ok: false, message: "入力内容を確認してください。", errors, values };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "現在、コメント機能は利用できません。" };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { ok: false, message: "情報提供を書き込むにはログインが必要です。", values };
  }

  // status はDB側のトリガーで必ず「調査中（investigating）」に設定され、投稿直後から公開される
  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      category,
      case_slug: slug,
      user_id: auth.user.id,
      body,
      source_url: sourceUrl || null,
      info_checked_at: checkedAt?.toISOString() ?? null,
    })
    .select("id")
    .single();

  if (error || !comment) {
    if (error?.message.includes("too_many_comments")) {
      return { ok: false, message: "短時間に多くの投稿がありました。しばらく時間をおいてから再度お試しください。", values };
    }
    console.error("[comments] failed to insert", error?.message);
    return { ok: false, message: "投稿に失敗しました。時間をおいて再度お試しください。", values };
  }

  const failed = await uploadAttachments(supabase, comment.id, prepared.images);

  revalidatePath(`/${category}/${slug}`);
  if (failed > 0) {
    return {
      ok: true,
      message: `本文は投稿されましたが、画像${failed}枚の保存に失敗しました。投稿は「調査中」として公開されています。`,
    };
  }
  return { ok: true, message: "投稿しました。内容は「調査中」として公開されています。" };
}

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/**
 * 画像を comments/{commentId}/{uuid}.{拡張子} に保存し、comment_attachments に登録する。
 * 元のファイル名は使わない。失敗した枚数を返す。
 */
async function uploadAttachments(supabase: SupabaseServerClient, commentId: string, images: SanitizedImage[]) {
  const rows = [];
  for (const [sortOrder, image] of images.entries()) {
    const path = `comments/${commentId}/${crypto.randomUUID()}.${extensionByMime[image.mimeType]}`;
    const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, image.bytes, {
      contentType: image.mimeType,
      upsert: false,
    });
    if (error) {
      console.error("[comments] failed to upload attachment", error.message);
      continue;
    }
    const size = readImageSize(image);
    rows.push({
      comment_id: commentId,
      storage_path: path,
      media_type: "image",
      mime_type: image.mimeType,
      file_size: image.bytes.length,
      sort_order: sortOrder,
      width: size?.width ?? null,
      height: size?.height ?? null,
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("comment_attachments").insert(rows);
    if (error) {
      console.error("[comments] failed to insert attachments", error.message);
      return images.length;
    }
  }
  return images.length - rows.length;
}
