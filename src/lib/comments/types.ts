import type { CategorySlug } from "../site";

/** DB の comment_status と対応。新規投稿は必ず investigating（調査中） */
export type CommentStatus = "investigating" | "verified" | "reference" | "archived" | "rejected";

export const commentStatusLabels: Record<CommentStatus, string> = {
  investigating: "調査中",
  verified: "確認済み",
  reference: "参考情報",
  archived: "掲載終了",
  rejected: "却下",
};

/** 各ステータスの投稿の下に表示する説明 */
export const commentStatusNotes: Record<CommentStatus, string> = {
  investigating: "この投稿内容は現在確認中です。事実として確認されたものではありません。",
  verified: "運営側で情報源を確認済みの投稿です。",
  reference: "参考情報として掲載している投稿です。事実として確認されたものではありません。",
  archived: "掲載を終了した投稿です。",
  rejected: "掲載基準を満たさなかった投稿です。",
};

/** public_comments ビューの1行（メールアドレス・ユーザーIDは含まない） */
export type PublicComment = {
  id: string;
  category: CategorySlug;
  case_slug: string;
  body: string;
  source_url: string | null;
  info_checked_at: string | null;
  status: CommentStatus;
  created_at: string;
  display_name: string;
};

export type CommentFormState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"body" | "sourceUrl" | "infoCheckedAt" | "agreement", string>>;
  /** エラー時に入力内容を復元するための値（React はアクション完了後にフォームをリセットする） */
  values?: { body: string; sourceUrl: string; infoCheckedAt: string };
};
