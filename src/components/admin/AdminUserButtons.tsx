"use client";

import { removeAdmin, revokeAdminInvite } from "@/lib/admin/admin-user-actions";
import { ConfirmButton } from "./ui";

export function RevokeInviteButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      label="取り消す"
      confirmLabel="取り消す"
      description="この招待リンクを使えなくします。"
      onConfirm={() => revokeAdminInvite(id)}
    />
  );
}

export function RemoveAdminButton({ userId, email }: { userId: string; email: string }) {
  return (
    <ConfirmButton
      label="権限を解除"
      confirmLabel="解除する"
      description={`${email} の管理者権限を解除します。`}
      onConfirm={() => removeAdmin(userId)}
    />
  );
}
