"use server";

import { redirect } from "next/navigation";
import { CASE_IMAGE_BUCKET, MAX_CASE_IMAGES, caseImageRule, extensionByMime } from "../media/config";
import { ImageValidationError, readImageSize, sanitizeImage, type SanitizedImage } from "../media/sanitize";
import { requireAdminAction, type ActionState } from "./auth";
import { normalizeCase, validateCase, type CaseFormValues } from "./case-form";
import { revalidatePublicSite } from "./revalidate";

/** 案件の保存（新規作成・更新）。本文・情報源・時系列・事実を1トランザクションで保存する */
export async function saveCase(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let values: CaseFormValues;
  try {
    values = normalizeCase(JSON.parse(String(formData.get("payload"))) as CaseFormValues);
  } catch {
    return { ok: false, message: "送信内容を読み取れませんでした。" };
  }

  const errors = validateCase(values);
  if (errors.length > 0) return { ok: false, message: "入力内容を確認してください。", errors };

  let id: string;
  try {
    const { supabase } = await requireAdminAction();
    const { data, error } = await supabase.rpc("admin_save_case", { payload: values });
    if (error) {
      if (error.code === "23505") return { ok: false, message: "同じカテゴリに同じURL用ID（slug）の案件があります。" };
      throw error;
    }
    id = data as string;
  } catch (e) {
    console.error("[admin] saveCase failed", e);
    return { ok: false, message: "保存に失敗しました。管理者権限とネットワークを確認してください。" };
  }

  revalidatePublicSite();
  if (!values.id) redirect(`/admin/cases/${id}?created=1`);
  return {
    ok: true,
    message: values.publish_status === "published" ? "保存しました（公開中）。" : "保存しました（サイトには表示されていません）。",
  };
}

export async function deleteCase(id: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminAction();
    const [{ data: row }, { data: images }] = await Promise.all([
      supabase.from("cases").select("main_image_path").eq("id", id).maybeSingle(),
      supabase.from("case_images").select("storage_path").eq("case_id", id),
    ]);
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) throw error;
    // 案件画像（複数）と旧メイン画像のファイルも削除する
    const paths = [...new Set([...(images ?? []).map((i) => i.storage_path as string), row?.main_image_path])].filter(
      (path): path is string => Boolean(path),
    );
    if (paths.length > 0) await supabase.storage.from(CASE_IMAGE_BUCKET).remove(paths);
  } catch (e) {
    console.error("[admin] deleteCase failed", e);
    return { ok: false, message: "削除に失敗しました。" };
  }
  revalidatePublicSite();
  redirect("/admin/cases?deleted=1");
}

const MAX_TEXT = 300;
const UUID = /^[0-9a-f-]{36}$/;

type ImageMeta = { alt: string; caption: string; source_name: string; source_url: string };

function validateImageMeta(meta: ImageMeta, label: string): string[] {
  const errors: string[] = [];
  if (!meta.alt.trim()) errors.push(`${label}の代替テキスト（alt）を入力してください。画像の内容を説明する短い文です。`);
  if ([meta.alt, meta.caption, meta.source_name].some((v) => v.length > MAX_TEXT)) errors.push(`${label}の各項目は${MAX_TEXT}文字以内にしてください。`);
  if (meta.source_url && !/^https?:\/\/\S+$/.test(meta.source_url)) errors.push(`${label}の出典URLは http:// または https:// で始めてください。`);
  return errors;
}

const clean = (meta: ImageMeta) => ({
  alt: meta.alt.trim(),
  caption: meta.caption.trim() || null,
  source_name: meta.source_name.trim() || null,
  source_url: meta.source_url.trim() || null,
});

/**
 * 案件画像を1枚追加する（複数枚はクライアントから1枚ずつ順に送る＝1回の送信サイズを抑える）。
 * 形式はファイルの中身で判定し、メタデータを除去してから cases/{caseId}/{uuid}.{ext} に保存する。
 */
export async function uploadCaseImage(formData: FormData): Promise<ActionState> {
  const caseId = String(formData.get("caseId") ?? "");
  const file = formData.get("image");
  const meta: ImageMeta = {
    alt: String(formData.get("alt") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    source_name: String(formData.get("source_name") ?? ""),
    source_url: String(formData.get("source_url") ?? ""),
  };

  if (!UUID.test(caseId)) return { ok: false, message: "案件が見つかりません。" };
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "画像ファイルがありません。" };
  if (file.size > caseImageRule.maxBytes) return { ok: false, message: "画像は10MB以下にしてください。" };
  const errors = validateImageMeta(meta, "画像");
  if (errors.length > 0) return { ok: false, message: "入力内容を確認してください。", errors };

  let image: SanitizedImage;
  try {
    image = sanitizeImage(new Uint8Array(await file.arrayBuffer()));
  } catch (e) {
    if (e instanceof ImageValidationError) return { ok: false, message: "JPEG / PNG / WebP 以外の形式か、壊れたファイルです。" };
    throw e;
  }

  try {
    const { supabase } = await requireAdminAction();
    const { data: existing, error: countError } = await supabase
      .from("case_images")
      .select("sort_order")
      .eq("case_id", caseId)
      .order("sort_order", { ascending: false });
    if (countError) throw countError;
    if ((existing ?? []).length >= MAX_CASE_IMAGES) {
      return { ok: false, message: `画像は1案件あたり${MAX_CASE_IMAGES}枚までです。` };
    }

    const path = `cases/${caseId}/${crypto.randomUUID()}.${extensionByMime[image.mimeType]}`;
    const { error: uploadError } = await supabase.storage
      .from(CASE_IMAGE_BUCKET)
      .upload(path, image.bytes, { contentType: image.mimeType, upsert: false, cacheControl: "31536000" });
    if (uploadError) throw uploadError;

    const size = readImageSize(image);
    const { error } = await supabase.from("case_images").insert({
      case_id: caseId,
      storage_path: path,
      ...clean(meta),
      width: size?.width ?? null,
      height: size?.height ?? null,
      sort_order: (existing?.[0]?.sort_order ?? -1) + 1,
    });
    if (error) {
      await supabase.storage.from(CASE_IMAGE_BUCKET).remove([path]);
      throw error;
    }
  } catch (e) {
    console.error("[admin] uploadCaseImage failed", e);
    return { ok: false, message: "画像の保存に失敗しました。" };
  }

  revalidatePublicSite();
  return { ok: true, message: "画像を追加しました。" };
}

/** 登録済み画像の alt・キャプション・出典と並び順をまとめて保存する（items の順番がそのまま表示順） */
export async function saveCaseImages(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const caseId = String(formData.get("caseId") ?? "");
  let items: (ImageMeta & { id: string })[];
  try {
    items = JSON.parse(String(formData.get("items")));
  } catch {
    return { ok: false, message: "送信内容を読み取れませんでした。" };
  }
  if (!UUID.test(caseId) || !Array.isArray(items) || items.some((i) => !UUID.test(i.id))) {
    return { ok: false, message: "送信内容が正しくありません。" };
  }
  const errors = items.flatMap((item, i) => validateImageMeta(item, `画像${i + 1}`));
  if (errors.length > 0) return { ok: false, message: "入力内容を確認してください。", errors };

  try {
    const { supabase } = await requireAdminAction();
    for (const [index, item] of items.entries()) {
      const { error } = await supabase
        .from("case_images")
        .update({ ...clean(item), sort_order: index })
        .eq("id", item.id)
        .eq("case_id", caseId);
      if (error) throw error;
    }
  } catch (e) {
    console.error("[admin] saveCaseImages failed", e);
    return { ok: false, message: "画像情報の保存に失敗しました。" };
  }

  revalidatePublicSite();
  return { ok: true, message: "画像の情報と並び順を保存しました。" };
}

/** 画像を1枚削除する（Storage のファイルも削除） */
export async function deleteCaseImage(imageId: string): Promise<ActionState> {
  if (!UUID.test(imageId)) return { ok: false, message: "画像が見つかりません。" };
  try {
    const { supabase } = await requireAdminAction();
    const { data: row } = await supabase.from("case_images").select("storage_path").eq("id", imageId).maybeSingle();
    if (!row) return { ok: false, message: "画像が見つかりません。" };
    const { error } = await supabase.from("case_images").delete().eq("id", imageId);
    if (error) throw error;
    await supabase.storage.from(CASE_IMAGE_BUCKET).remove([row.storage_path]);
  } catch (e) {
    console.error("[admin] deleteCaseImage failed", e);
    return { ok: false, message: "画像の削除に失敗しました。" };
  }
  revalidatePublicSite();
  return { ok: true, message: "画像を削除しました。" };
}
