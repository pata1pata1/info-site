import { getAdminContext, type AdminContext } from "./auth";

/** 事案の「アニマルポリス」欄（case_admin_notes。管理者のみ RLS で読める）。未登録は空文字 */
export async function getAnimalPoliceNote(supabase: AdminContext["supabase"], caseId: string) {
  const { data, error } = await supabase.from("case_admin_notes").select("animal_police_note").eq("case_id", caseId).maybeSingle();
  return { note: (data?.animal_police_note as string | undefined) ?? "", error };
}

/**
 * 公開側の事案詳細ページ用。管理者でログインしている場合だけ取得し、それ以外は null（＝欄を出さない）。
 * 管理者判定はサーバー側（is_admin）で行い、取得自体も RLS で管理者に限られる。
 */
export async function getAnimalPoliceNoteForViewer(caseId: string): Promise<string | null> {
  const admin = await getAdminContext();
  if (!admin) return null;
  const { note, error } = await getAnimalPoliceNote(admin.supabase, caseId);
  if (error) console.error("[case] animal police note failed", error.message);
  return note;
}
