"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { postComment } from "@/lib/comments/actions";
import type { CommentFormState } from "@/lib/comments/types";
import { BODY_MAX, BODY_MIN } from "@/lib/comments/validation";
import type { PreparedImage } from "@/lib/media/prepare-image";
import type { CategorySlug } from "@/lib/site";
import { FormMessage } from "@/components/ui/FormMessage";
import { errorClass, hintClass, inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";
import { ImagePicker } from "./ImagePicker";

const initialState: CommentFormState = { ok: false };

type Props = { category: CategorySlug; slug: string };

/** 情報提供コメントの投稿フォーム（本文必須・画像は任意で最大5枚） */
export function CommentForm({ category, slug }: Props) {
  const [state, formAction, pending] = useActionState(postComment, initialState);

  // 投稿に成功するたびに入力欄（選択中の画像を含む）を作り直して空にする
  const [formKey, setFormKey] = useState(0);
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.ok) setFormKey((k) => k + 1);
  }

  return (
    <div className="panel space-y-5 rounded-xl p-5 md:p-6">
      <PostingNotice />
      <FormMessage ok={state.ok} message={state.message} />
      <CommentFields
        key={formKey}
        category={category}
        slug={slug}
        state={state}
        pending={pending}
        formAction={formAction}
      />
    </div>
  );
}

function PostingNotice() {
  return (
    <div className="rounded-lg border border-amber-300/20 bg-amber-400/[0.04] px-4 py-3 text-xs leading-relaxed text-slate-300">
      <p className="mb-1.5 font-semibold text-amber-100">投稿前にご確認下さい</p>
      <ul className="list-disc space-y-1 pl-4 marker:text-amber-300/60">
        <li>
          投稿した内容は運営側の確認前の情報として<strong className="text-amber-100">「調査中」</strong>の表記の元に一般公開されます。
        </li>
        <li>個人宅の住所詳細（番地や部屋番号）、電話番号、家族に関する情報は投稿しないで下さい。</li>
        <li>事案と無関係な第三者の個人情報を含めないで下さい。</li>
        <li>脅迫、暴力や嫌がらせを促す内容、根拠のない誹謗中傷は投稿できません。</li>
        <li>アップロードする画像は出典元がわかる場合はご記載下さい。</li>
      </ul>
    </div>
  );
}

type FieldsProps = Props & {
  state: CommentFormState;
  pending: boolean;
  formAction: (formData: FormData) => void;
};

function CommentFields({ category, slug, state, pending, formAction }: FieldsProps) {
  const [images, setImages] = useState<PreparedImage[]>([]);
  const errors = state.errors ?? {};
  const values = state.values;

  // 入力欄を破棄するとき（投稿成功・ページ離脱）にプレビュー用URLを解放する
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)), []);

  function submit(formData: FormData) {
    // 加工済みの画像だけを送る。ファイル名は固定し、元のファイル名は送信しない
    images.forEach((image) => formData.append("images", image.blob, "image"));
    formAction(formData);
  }

  return (
    <form action={submit} className="space-y-5">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="slug" value={slug} />

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
          placeholder="この事案について追加の情報があれば記入してください。"
        />
        {errors.body ? (
          <p className={errorClass}>{errors.body}</p>
        ) : (
          <p className={hintClass}>{BODY_MIN}〜{BODY_MAX}文字。画像だけの投稿はできません。</p>
        )}
      </div>

      <ImagePicker images={images} onChange={setImages} serverError={errors.images} disabled={pending} />

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
          <span>上記の注意事項を確認しました。</span>
        </label>
        {errors.agreement && <p className={errorClass}>{errors.agreement}</p>}
      </div>

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "送信中…" : "情報提供を投稿する"}
      </button>
    </form>
  );
}
