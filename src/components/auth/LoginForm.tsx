"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/lib/auth/actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, { ok: false });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {/* ログインエラーがあればそれを優先し、なければ案内メッセージを表示する */}
      {state.message ? <FormMessage ok={false} message={state.message} /> : <FormMessage ok message={notice} />}

      <div>
        <label htmlFor="email" className={labelClass}>メールアドレス</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>パスワード</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>

      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
        {pending ? "ログイン中…" : "ログイン"}
      </button>

      <p className="text-center text-xs text-slate-500">
        アカウントをお持ちでない方は
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="mx-1 text-cyan-300 hover:text-cyan-200">会員登録</Link>
      </p>
    </form>
  );
}
