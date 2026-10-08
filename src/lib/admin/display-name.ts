/**
 * 管理画面での管理者の表示名（管理者一覧・管理者メモで共通）。
 * ニックネーム（profiles.display_name）を主表示にし、未設定ならメールアドレスを主表示にする。
 * secondary はニックネームがあるときだけ補助表示するメールアドレス。
 */
export function adminDisplayName(nickname: string | null | undefined, email: string | null | undefined) {
  const name = nickname?.trim() || null;
  return {
    primary: name ?? email ?? "元管理者",
    secondary: name ? (email ?? null) : null,
  };
}
