"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/lib/admin/auth";

/** 保存結果（メッセージとエラー一覧） */
export function ActionResult({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={`rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${
        state.ok ? "bg-cyan-400/[0.06] text-cyan-100 ring-cyan-300/25" : "bg-rose-400/[0.06] text-rose-200 ring-rose-300/25"
      }`}
    >
      <p>{state.message}</p>
      {state.errors && state.errors.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
          {state.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * 削除などの取り消せない操作用のボタン。
 * 1回目のクリックで確認表示に切り替え、2回目で実行する（ブラウザの確認ダイアログは使わない）。
 */
export function ConfirmButton({
  label,
  confirmLabel,
  description,
  onConfirm,
}: {
  label: string;
  confirmLabel: string;
  description: string;
  onConfirm: () => Promise<ActionState | void>;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-inset ring-rose-400/30 transition hover:bg-rose-500/10"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-rose-500/[0.06] px-3 py-2 ring-1 ring-inset ring-rose-400/30">
      <span className="text-xs text-rose-200">{description}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await onConfirm();
            if (result && !result.ok) setError(result.message ?? "失敗しました。");
          })
        }
        className="rounded-md bg-rose-500/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
      >
        {pending ? "処理中…" : confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200">
        やめる
      </button>
      {error && <span className="w-full text-xs text-rose-300">{error}</span>}
    </div>
  );
}

/** 管理画面の入力グループ */
export function Fieldset({ legend, description, children }: { legend: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="panel space-y-5 rounded-xl p-5 md:p-6">
      <legend className="sr-only">{legend}</legend>
      <div>
        <h2 className="text-sm font-bold tracking-wide text-slate-100">{legend}</h2>
        {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}
