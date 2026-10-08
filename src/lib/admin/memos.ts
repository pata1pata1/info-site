import type { AdminContext } from "./auth";
import { adminDisplayName } from "./display-name";

/** DB の check 制約（2000文字）と合わせる */
export const MEMO_BODY_MAX = 2000;

const dateTime = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** 投稿日時の表示（例：2026/10/08 10:15） */
export const formatMemoDate = (value: string) => dateTime.format(new Date(value));

/** admin_list_memos() の1行 */
export type AdminMemo = {
  id: string;
  author_user_id: string | null;
  author_email: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  /** 投稿者の現在のニックネーム（profiles.display_name）。メモ側には保存せず、表示時に取得する */
  author_name: string | null;
};

/** 投稿者の表示：ニックネーム → メールアドレス → 元管理者（管理者一覧と同じルール） */
export const memoAuthorLabel = (memo: AdminMemo) => adminDisplayName(memo.author_name, memo.author_email).primary;

/** 管理者メモを新しい順に取得する（関数側でも管理者か確認している） */
export async function listMemos(supabase: AdminContext["supabase"], limit: number) {
  const { data, error } = await supabase.rpc("admin_list_memos", { p_limit: limit });
  const rows = (data ?? []) as Omit<AdminMemo, "author_name">[];

  // 管理者は profiles を参照できる（RLS「管理者は投稿者の表示名を参照できる」）
  const authorIds = [...new Set(rows.flatMap((m) => (m.author_user_id ? [m.author_user_id] : [])))];
  const { data: profiles } = authorIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", authorIds)
    : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string | null]));

  const memos: AdminMemo[] = rows.map((m) => ({ ...m, author_name: (m.author_user_id && nameById.get(m.author_user_id)) || null }));
  return { memos, error };
}
