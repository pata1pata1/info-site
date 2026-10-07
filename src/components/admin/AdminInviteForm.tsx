"use client";

import { useActionState, useState } from "react";
import { createAdminInvite, type InviteState } from "@/lib/admin/admin-user-actions";
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { ActionResult, Fieldset } from "./ui";

const dateTime = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium", timeStyle: "short" });

/** 管理者を招待する：招待リンクを発行してコピーする */
export function AdminInviteForm() {
  const [state, formAction, pending] = useActionState(createAdminInvite, { ok: false } as InviteState);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch {
      setCopied(null);
    }
  }

  return (
    <Fieldset
      legend="管理者を招待する"
      description="招待リンクを発行し、招待する人に届けてください。招待された本人が会員登録・メール確認・ログインを済ませてからリンクを開くと、管理者になります。招待したメールアドレスと異なるアカウントでは受け取れません。"
    >
      <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
        <label className="block">
          <span className={labelClass}>招待するメールアドレス</span>
          <input name="email" type="email" required autoComplete="off" placeholder="admin@example.com" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>有効期限</span>
          <select name="expiresInDays" defaultValue="7" className={inputClass}>
            <option value="1">1日</option>
            <option value="3">3日</option>
            <option value="7">7日</option>
          </select>
        </label>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "発行中…" : "招待リンクを発行"}
        </button>
      </form>

      <ActionResult state={state} />

      {state.ok && state.inviteUrl && (
        <div className="space-y-2 rounded-lg border border-amber-300/25 bg-amber-400/[0.04] p-4">
          <p className="text-xs text-slate-300">
            <span className="font-semibold text-amber-100">{state.email}</span> 宛ての招待リンク
            {state.expiresAt && <span className="text-slate-500">（{dateTime.format(new Date(state.expiresAt))} まで有効）</span>}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input readOnly value={state.inviteUrl} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} mt-0 font-mono text-xs`} />
            <button type="button" onClick={() => copy(state.inviteUrl!)} className={`${secondaryButtonClass} shrink-0`}>
              {copied === state.inviteUrl ? "コピーしました" : "リンクをコピー"}
            </button>
          </div>
          <p className={hintClass}>
            このリンクは安全のため、この画面でのみ表示されます（サーバーには暗号化した値だけを保存しています）。
            紛失した場合は、もう一度発行してください（以前のリンクは自動で無効になります）。
          </p>
        </div>
      )}
    </Fieldset>
  );
}
