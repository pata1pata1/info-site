"use server";

import { revalidatePath } from "next/cache";
import { getCase } from "../cases";
import { categories, type CategorySlug } from "../site";
import { createClient } from "../supabase/server";
import type { CommentFormState } from "./types";
import { BODY_MAX, BODY_MIN, findProhibitedContent, isValidHttpUrl } from "./validation";

export async function postComment(_prev: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const category = String(formData.get("category") ?? "") as CategorySlug;
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const infoCheckedAt = String(formData.get("infoCheckedAt") ?? "").trim();
  const agreed = formData.get("agreement") === "on";
  const values = { body, sourceUrl, infoCheckedAt };

  if (!categories.some((c) => c.slug === category) || !getCase(category, slug)) {
    return { ok: false, message: "投稿先のページが見つかりません。" };
  }

  const errors: CommentFormState["errors"] = {};
  if (body.length < BODY_MIN || body.length > BODY_MAX) {
    errors.body = `本文は${BODY_MIN}〜${BODY_MAX}文字で入力してください。`;
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
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "入力内容を確認してください。", errors, values };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "現在、コメント機能は利用できません。" };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { ok: false, message: "情報提供を書き込むにはログインが必要です。", values };
  }

  // status はDB側のトリガーで必ず「調査中（investigating）」に設定される
  const { error } = await supabase.from("comments").insert({
    category,
    case_slug: slug,
    user_id: auth.user.id,
    body,
    source_url: sourceUrl || null,
    info_checked_at: checkedAt?.toISOString() ?? null,
  });

  if (error) {
    if (error.message.includes("too_many_comments")) {
      return { ok: false, message: "短時間に多くの投稿がありました。しばらく時間をおいてから再度お試しください。", values };
    }
    console.error("[comments] failed to insert", error.message);
    return { ok: false, message: "投稿に失敗しました。時間をおいて再度お試しください。", values };
  }

  revalidatePath(`/${category}/${slug}`);
  return { ok: true, message: "投稿を受け付けました。内容は「調査中」として掲載されます。" };
}
