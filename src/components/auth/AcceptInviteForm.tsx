"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { acceptAdminInvite } from "@/lib/admin/invite-accept-actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { primaryButtonClass } from "@/components/ui/form-styles";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptAdminInvite, { ok: false } as ActionState);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormMessage ok={state.ok} message={state.message} />
      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
        {pending ? "確認中…" : "管理者の招待を受け取る"}
      </button>
    </form>
  );
}
