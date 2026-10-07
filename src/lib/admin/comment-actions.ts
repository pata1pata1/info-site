"use server";

import { revalidatePath } from "next/cache";
import type { CommentStatus } from "../comments/types";
import { ATTACHMENT_BUCKET } from "../media/config";
import { requireAdminAction, type ActionState } from "./auth";

const STATUSES: CommentStatus[] = ["investigating", "verified", "reference", "archived", "rejected"];

/** 情報提供コメントのステータス変更・非公開化 */
export async function updateComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status")) as CommentStatus;
  const isHidden = formData.get("is_hidden") === "on";
  if (!STATUSES.includes(status)) return { ok: false, message: "ステータスが正しくありません。" };

  try {
    const { supabase } = await requireAdminAction();
    const { data, error } = await supabase
      .from("comments")
      .update({ status, is_hidden: isHidden })
      .eq("id", id)
      .select("category, case_slug")
      .single();
    if (error) throw error;
    revalidatePath(`/${data.category}/${data.case_slug}`);
  } catch (e) {
    console.error("[admin] updateComment failed", e);
    return { ok: false, message: "更新に失敗しました。" };
  }
  revalidatePath("/admin/comments");
  return { ok: true, message: "更新しました。" };
}

/** 情報提供コメントの削除（添付画像のファイルも削除する） */
export async function deleteComment(id: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminAction();
    const [{ data: comment }, { data: attachments }] = await Promise.all([
      supabase.from("comments").select("category, case_slug").eq("id", id).maybeSingle(),
      supabase.from("comment_attachments").select("storage_path").eq("comment_id", id),
    ]);
    const paths = (attachments ?? []).map((a) => a.storage_path as string);
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from(ATTACHMENT_BUCKET).remove(paths);
      if (storageError) throw storageError;
    }
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw error;
    if (comment) revalidatePath(`/${comment.category}/${comment.case_slug}`);
  } catch (e) {
    console.error("[admin] deleteComment failed", e);
    return { ok: false, message: "削除に失敗しました。" };
  }
  revalidatePath("/admin/comments");
  return { ok: true, message: "削除しました。" };
}
