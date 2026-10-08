"use client";

import { useActionState } from "react";
import { removeAdmin, revokeAdminInvite } from "@/lib/admin/admin-user-actions";
import { updateDisplayName, type AuthFormState } from "@/lib/auth/actions";
import { inputClass, primaryButtonClass } from "@/components/ui/form-styles";
import { ActionResult, ConfirmButton } from "./ui";

/**
 * 自分のニックネーム（profiles.display_name）の設定。マイページの表示名と同じ項目で、
 * 本人だけが更新できる（RLS「本人のみプロフィールを更新」）
 */
export function AdminNicknameForm({ current }: { current: string | null }) {
  const [state, formAction, pending] = useActionState(updateDisplayName, { ok: false } as AuthFormState);

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <label htmlFor="admin-nickname" className="text-xs text-slate-400">ニックネーム</label>
        <input
          id="admin-nickname"
          name="displayName"
          type="text"
          maxLength={30}
          defaultValue={current ?? ""}
          placeholder="未設定"
          className={`${inputClass} mt-0 w-48 py-1.5`}
        />
        <button type="submit" disabled={pending} className={`${primaryButtonClass} px-3 py-1.5 text-xs`}>
          {pending ? "保存中…" : "保存"}
        </button>
      </form>
      <ActionResult state={state} />
    </div>
  );
}

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
