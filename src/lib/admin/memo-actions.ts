"use server";

import { revalidatePath } from "next/cache";
import { MEMO_BODY_MAX } from "./memos";
import { requireAdminAction, type ActionState } from "./auth";

function readBody(formData: FormData): string | ActionState {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, message: "本文を入力してください。" };
  if (body.length > MEMO_BODY_MAX) return { ok: false, message: `本文は${MEMO_BODY_MAX}文字以内で入力してください。` };
  return body;
}

function revalidateMemos() {
  revalidatePath("/admin/memos");
  revalidatePath("/admin");
}

/** 管理者メモの投稿（投稿者は DB 側でログイン中の本人に固定される） */
export async function createMemo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const body = readBody(formData);
  if (typeof body !== "string") return body;

  try {
    const { supabase, userId } = await requireAdminAction();
    const { error } = await supabase.from("admin_memos").insert({ author_user_id: userId, body });
    if (error) throw error;
  } catch (e) {
    console.error("[admin] createMemo failed", e);
    return { ok: false, message: "投稿に失敗しました。" };
  }
  revalidateMemos();
  return { ok: true, message: "投稿しました。" };
}

/** 管理者メモの編集（本人のメモのみ。RLS でも本人以外の更新は拒否される） */
export async function updateMemo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const body = readBody(formData);
  if (typeof body !== "string") return body;

  try {
    const { supabase, userId } = await requireAdminAction();
    const { data, error } = await supabase
      .from("admin_memos")
      .update({ body })
      .eq("id", id)
      .eq("author_user_id", userId)
      .select("id");
    if (error) throw error;
    if (!data?.length) return { ok: false, message: "自分が投稿したメモだけ編集できます。" };
  } catch (e) {
    console.error("[admin] updateMemo failed", e);
    return { ok: false, message: "更新に失敗しました。" };
  }
  revalidateMemos();
  return { ok: true, message: "更新しました。" };
}

/** 管理者メモの削除（本人のメモのみ。RLS でも本人以外の削除は拒否される） */
export async function deleteMemo(id: string): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdminAction();
    const { data, error } = await supabase.from("admin_memos").delete().eq("id", id).eq("author_user_id", userId).select("id");
    if (error) throw error;
    if (!data?.length) return { ok: false, message: "自分が投稿したメモだけ削除できます。" };
  } catch (e) {
    console.error("[admin] deleteMemo failed", e);
    return { ok: false, message: "削除に失敗しました。" };
  }
  revalidateMemos();
  return { ok: true, message: "削除しました。" };
}
