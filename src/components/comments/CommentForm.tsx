"use client";

import { useActionState } from "react";
import { postComment } from "@/lib/comments/actions";
import type { CommentFormState } from "@/lib/comments/types";
import { BODY_MAX, BODY_MIN } from "@/lib/comments/validation";
import type { CategorySlug } from "@/lib/site";
import { FormMessage } from "@/components/ui/FormMessage";
import { errorClass, hintClass, inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";

const initialState: CommentFormState = { ok: false };

/**
 * 情報提供コメントの投稿フォーム。
 * 将来の画像添付は、このフォームに file 入力を追加し comment_attachments テーブルへ保存する想定。
 */
export function CommentForm({ category, slug }: { category: CategorySlug; slug: string }) {
  const [state, formAction, pending] = useActionState(postComment, initialState);
  const errors = state.errors ?? {};
  const values = state.values;

  return (
    <form action={formAction} className="panel space-y-5 rounded-xl p-5 md:p-6">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="slug" value={slug} />

      <div className="rounded-lg bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-slate-400 ring-1 ring-inset ring-line">
        <p className="mb-1 font-semibold text-slate-300">投稿ルール</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>個人宅の詳細住所（番地・部屋番号）、電話番号、家族情報など、無関係な個人情報は書き込まないでください。</li>
          <li>脅迫、暴力や嫌がらせを促す内容、根拠のない誹謗中傷は投稿できません。</li>
          <li>可能な限り、報道・公的機関の発表など確認できる情報源のURLを添えてください。</li>
          <li>投稿は「調査中」として掲載され、運営側の確認後にステータスが変更されます。不適切な投稿は非公開にする場合があります。</li>
        </ul>
      </div>

      <FormMessage ok={state.ok} message={state.message} />

      <div>
        <label htmlFor="comment-body" className={labelClass}>
          コメント本文 <span className="font-normal text-rose-300/80">必須</span>
        </label>
        <textarea
          id="comment-body"
          name="body"
          required
          minLength={BODY_MIN}
          maxLength={BODY_MAX}
          rows={6}
          defaultValue={values?.body}
          aria-invalid={Boolean(errors.body)}
          className={`${inputClass} resize-y leading-relaxed`}
          placeholder="この案件について追加の情報があれば記入してください。"
        />
        {errors.body ? <p className={errorClass}>{errors.body}</p> : <p className={hintClass}>{BODY_MIN}〜{BODY_MAX}文字</p>}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="comment-source" className={labelClass}>
            情報源URL <span className="font-normal text-slate-500">任意</span>
          </label>
          <input
            id="comment-source"
            name="sourceUrl"
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={values?.sourceUrl}
            aria-invalid={Boolean(errors.sourceUrl)}
            className={inputClass}
          />
          {errors.sourceUrl && <p className={errorClass}>{errors.sourceUrl}</p>}
        </div>
        <div>
          <label htmlFor="comment-checked-at" className={labelClass}>
            情報を確認した日時 <span className="font-normal text-slate-500">任意</span>
          </label>
          <input
            id="comment-checked-at"
            name="infoCheckedAt"
            type="datetime-local"
            defaultValue={values?.infoCheckedAt}
            aria-invalid={Boolean(errors.infoCheckedAt)}
            className={`${inputClass} [color-scheme:dark]`}
          />
          {errors.infoCheckedAt && <p className={errorClass}>{errors.infoCheckedAt}</p>}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
          <input type="checkbox" name="agreement" required className="mt-0.5 accent-cyan-400" />
          <span>投稿ルールを確認し、無関係な個人情報・脅迫・暴力を促す内容・誹謗中傷を含んでいないことを確認しました。</span>
        </label>
        {errors.agreement && <p className={errorClass}>{errors.agreement}</p>}
      </div>

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "送信中…" : "情報提供を投稿する"}
      </button>
    </form>
  );
}
