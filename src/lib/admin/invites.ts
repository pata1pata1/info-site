export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

/** 表示用の招待状態。期限を過ぎた未使用の招待は「期限切れ」とする（受け取り時にも DB 側の関数で拒否される） */
export function inviteDisplayStatus(invite: { status: InviteStatus; expires_at: string }): InviteStatus {
  return invite.status === "pending" && new Date(invite.expires_at).getTime() <= Date.now() ? "expired" : invite.status;
}
