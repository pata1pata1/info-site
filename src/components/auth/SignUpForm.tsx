"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/lib/auth/actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { hintClass, inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";

const initialState: AuthFormState = { ok: false };

export function SignUpForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <FormMessage ok message={state.message} />
        <p className="text-xs leading-relaxed text-slate-500">
          メールが届かない場合は、迷惑メールフォルダをご確認ください。確認が完了するまでログインできません。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage ok={false} message={state.message} />

      <div>
        <label htmlFor="email" className={labelClass}>メールアドレス</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} className={inputClass} />
        <p className={hintClass}>メールアドレスはサイト上に公開されません。</p>
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>パスワード（8文字以上）</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="passwordConfirm" className={labelClass}>パスワード（確認）</label>
        <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="displayName" className={labelClass}>
          表示名 <span className="font-normal text-slate-500">（任意・30文字以内）</span>
        </label>
        <input id="displayName" name="displayName" type="text" maxLength={30} className={inputClass} placeholder="例：情報提供者A" />
        <p className={hintClass}>
          情報提供コメントに表示される名前です。未設定の場合は「登録ユーザー」と表示されます。本名やメールアドレスは使用しないでください。
        </p>
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <input type="checkbox" name="agreement" required className="mt-0.5 accent-cyan-400" />
        <span>
          情報提供コメントには、個人宅の住所・電話番号・家族情報など無関係な個人情報、脅迫・暴力を促す内容、誹謗中傷を書き込まないことに同意します。
        </span>
      </label>

      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
        {pending ? "送信中…" : "確認メールを送信して登録"}
      </button>

      <p className="text-center text-xs text-slate-500">
        登録済みの方は
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="mx-1 text-cyan-300 hover:text-cyan-200">ログイン</Link>
      </p>
    </form>
  );
}
