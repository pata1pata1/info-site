"use client";

import { useRef, useState } from "react";
import { MAX_ATTACHMENTS, imageRule } from "@/lib/media/config";
import { checkSelectedFile, prepareImage, PrepareImageError, type PreparedImage } from "@/lib/media/prepare-image";
import { errorClass, hintClass, labelClass } from "@/components/ui/form-styles";

type Props = {
  images: PreparedImage[];
  onChange: (images: PreparedImage[]) => void;
  serverError?: string;
  disabled?: boolean;
};

/** 添付画像の選択・プレビュー・個別削除 */
export function ImagePicker({ images, onChange, serverError, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = MAX_ATTACHMENTS - images.length;

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;

    const messages: string[] = [];
    if (files.length > remaining) messages.push(`画像は${MAX_ATTACHMENTS}枚までです。超えた分は追加されませんでした。`);

    setProcessing(true);
    const added: PreparedImage[] = [];
    for (const file of files.slice(0, Math.max(0, remaining))) {
      const problem = checkSelectedFile(file);
      if (problem) {
        messages.push(problem);
        continue;
      }
      try {
        added.push(await prepareImage(file));
      } catch (e) {
        messages.push(e instanceof PrepareImageError ? e.message : `「${file.name}」を処理できませんでした。`);
      }
    }
    setProcessing(false);
    setError(messages.length > 0 ? messages.join("\n") : null);
    if (added.length > 0) onChange([...images, ...added]);
  }

  function remove(id: string) {
    const target = images.find((image) => image.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(images.filter((image) => image.id !== id));
  }

  const shownError = error ?? serverError;

  return (
    <div>
      <p className={labelClass}>
        画像 <span className="font-normal text-slate-500">任意・最大{MAX_ATTACHMENTS}枚</span>
      </p>

      <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {images.map((image, index) => (
          <li key={image.id} className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-inset ring-line-strong">
            {/* eslint-disable-next-line @next/next/no-img-element -- ローカルの blob: URL のため next/image は使えない */}
            <img src={image.previewUrl} alt={`添付画像${index + 1}のプレビュー`} className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded bg-night/80 px-1.5 font-mono text-[10px] text-cyan-200">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(image.id)}
              disabled={disabled}
              aria-label={`添付画像${index + 1}（${image.originalName}）を削除`}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-night/85 text-slate-200 ring-1 ring-inset ring-line-strong transition hover:bg-rose-500/80 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </li>
        ))}

        {remaining > 0 && (
          <li className="aspect-square">
            <label
              className={`flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-300/30 bg-cyan-400/[0.03] text-center text-[11px] text-cyan-200/80 transition hover:border-cyan-300/60 hover:bg-cyan-400/[0.07] ${
                processing || disabled ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 16l5-5 4 4 3-3 6 6M12 2v6m-3-3h6" />
              </svg>
              {processing ? "処理中…" : "画像を追加"}
              <input
                ref={inputRef}
                type="file"
                accept={imageRule.mimeTypes.join(",")}
                multiple
                disabled={processing || disabled}
                onChange={(e) => handleFiles(e.target.files)}
                className="sr-only"
              />
            </label>
          </li>
        )}
      </ul>

      {shownError ? (
        <p className={`${errorClass} whitespace-pre-line`} role="alert">{shownError}</p>
      ) : (
        <p className={hintClass}>
          {imageRule.label}・1枚{imageRule.maxBytes / 1024 / 1024}MBまで。撮影位置などの情報（EXIF）は自動で削除してから送信します。
        </p>
      )}
    </div>
  );
}
