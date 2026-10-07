"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { deleteComment, updateComment } from "@/lib/admin/comment-actions";
import { commentStatusLabels, type CommentStatus } from "@/lib/comments/types";
import { inputClass, primaryButtonClass } from "@/components/ui/form-styles";
import { ActionResult, ConfirmButton } from "./ui";

/** コメント1件のステータス変更・非公開化・削除 */
export function CommentModeration({ id, status, isHidden }: { id: string; status: CommentStatus; isHidden: boolean }) {
  const [state, formAction, pending] = useActionState(updateComment, { ok: false } as ActionState);

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={id} />
        <select name="status" defaultValue={status} aria-label="ステータス" className={`${inputClass} mt-0 w-36 py-1.5`}>
          {(Object.keys(commentStatusLabels) as CommentStatus[]).map((s) => (
            <option key={s} value={s}>{commentStatusLabels[s]}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-300">
          <input type="checkbox" name="is_hidden" defaultChecked={isHidden} className="accent-rose-400" />
          非公開にする
        </label>
        <button type="submit" disabled={pending} className={`${primaryButtonClass} px-3 py-1.5 text-xs`}>
          {pending ? "更新中…" : "更新"}
        </button>
        <span className="ml-auto">
          <ConfirmButton
            label="削除"
            confirmLabel="完全に削除"
            description="コメントと添付画像を削除します。"
            onConfirm={() => deleteComment(id)}
          />
        </span>
      </form>
      <ActionResult state={state} />
    </div>
  );
}
