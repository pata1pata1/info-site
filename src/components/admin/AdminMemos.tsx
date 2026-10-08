"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { createMemo, deleteMemo, updateMemo } from "@/lib/admin/memo-actions";
import { formatMemoDate, MEMO_BODY_MAX, memoAuthorLabel, type AdminMemo } from "@/lib/admin/memos";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { ActionResult, ConfirmButton } from "./ui";

/** 管理者メモの新規投稿フォーム */
export function MemoForm() {
  const [state, formAction, pending] = useActionState(createMemo, { ok: false } as ActionState);

  return (
    // 送信後の入力欄のリセットは React が行う
    <form action={formAction} className="space-y-3">
      <textarea
        name="body"
        required
        maxLength={MEMO_BODY_MAX}
        rows={4}
        aria-label="メモ・伝言"
        placeholder="メモ・伝言を入力してください"
        className={`${inputClass} mt-0 resize-y leading-relaxed`}
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "投稿中…" : "投稿する"}
        </button>
      </div>
      <ActionResult state={state} />
    </form>
  );
}

/** メモ1件。本人のメモだけ編集・削除できる（サーバー側と RLS でも本人か確認している） */
export function MemoItem({ memo, editable }: { memo: AdminMemo; editable: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateMemo(prev, formData);
    if (result.ok) setEditing(false);
    return result;
  }, { ok: false } as ActionState);

  return (
    <li className="space-y-2 px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-medium text-slate-200">{memoAuthorLabel(memo)}</span>
        <time dateTime={memo.created_at} className="font-mono text-slate-500">
          {formatMemoDate(memo.created_at)}
        </time>
        {editable && !editing && (
          <span className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-inset ring-line-strong transition hover:bg-white/5"
            >
              編集
            </button>
            <ConfirmButton label="削除" confirmLabel="削除する" description="このメモを削除します。" onConfirm={() => deleteMemo(memo.id)} />
          </span>
        )}
      </div>

      {editing ? (
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="id" value={memo.id} />
          <textarea
            name="body"
            required
            maxLength={MEMO_BODY_MAX}
            rows={4}
            defaultValue={memo.body}
            aria-label="メモ本文"
            className={`${inputClass} mt-0 resize-y leading-relaxed`}
          />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={pending} className={`${primaryButtonClass} px-4 py-2 text-xs`}>
              {pending ? "保存中…" : "保存"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={`${secondaryButtonClass} px-4 py-2 text-xs`}>
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">{memo.body}</p>
      )}
      {!state.ok && <ActionResult state={state} />}
    </li>
  );
}
