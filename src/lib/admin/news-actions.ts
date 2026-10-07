"use server";

import { redirect } from "next/navigation";
import type { NewsLabel, PublishStatus } from "../cms/types";
import { requireAdminAction, type ActionState } from "./auth";
import { revalidatePublicSite } from "./revalidate";

const LABELS: NewsLabel[] = ["お知らせ", "更新", "メンテナンス"];
const STATUSES: PublishStatus[] = ["draft", "published", "private"];

export async function saveNews(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const label = String(formData.get("label")) as NewsLabel;
  const publishedOn = String(formData.get("published_on") ?? "");
  const status = String(formData.get("publish_status")) as PublishStatus;

  const errors: string[] = [];
  if (!title || title.length > 200) errors.push("タイトルは1〜200文字で入力してください。");
  if (body.length > 10000) errors.push("本文は10000文字以内にしてください。");
  if (!LABELS.includes(label)) errors.push("種別が正しくありません。");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) errors.push("公開日を入力してください。");
  if (!STATUSES.includes(status)) errors.push("公開状態が正しくありません。");
  if (errors.length > 0) return { ok: false, message: "入力内容を確認してください。", errors };

  const row = { title, body, label, published_on: publishedOn, publish_status: status };
  let newId: string | null = null;
  try {
    const { supabase } = await requireAdminAction();
    if (id) {
      const { error } = await supabase.from("news").update(row).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("news").insert(row).select("id").single();
      if (error) throw error;
      newId = data.id;
    }
  } catch (e) {
    console.error("[admin] saveNews failed", e);
    return { ok: false, message: "保存に失敗しました。" };
  }

  revalidatePublicSite();
  if (newId) redirect(`/admin/news/${newId}?created=1`);
  return { ok: true, message: "保存しました。" };
}

export async function deleteNews(id: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    console.error("[admin] deleteNews failed", e);
    return { ok: false, message: "削除に失敗しました。" };
  }
  revalidatePublicSite();
  redirect("/admin/news?deleted=1");
}
