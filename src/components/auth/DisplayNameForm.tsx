"use client";

import { useActionState } from "react";
import { updateDisplayName, type AuthFormState } from "@/lib/auth/actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { hintClass, inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";

const initialState: AuthFormState = { ok: false };

export function DisplayNameForm({ current }: { current: string | null }) {
  const [state, formAction, pending] = useActionState(updateDisplayName, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage ok={state.ok} message={state.message} />
      <div>
        <label htmlFor="displayName" className={labelClass}>表示名（30文字以内）</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={30}
          defaultValue={current ?? ""}
          placeholder="未設定（「登録ユーザー」と表示）"
          className={inputClass}
        />
        <p className={hintClass}>空欄で保存すると「登録ユーザー」と表示されます。本名やメールアドレスは使用しないでください。</p>
      </div>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "保存中…" : "表示名を保存"}
      </button>
    </form>
  );
}
