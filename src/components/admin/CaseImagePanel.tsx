"use client";

/* eslint-disable @next/next/no-img-element -- blob: URL と Storage の公開URLを表示する */

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { removeCaseImage, saveCaseImage } from "@/lib/admin/case-actions";
import { caseImageRule } from "@/lib/media/config";
import { checkSelectedFile, prepareImage, PrepareImageError, type PreparedImage } from "@/lib/media/prepare-image";
import { errorClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { ActionResult, ConfirmButton, Fieldset } from "./ui";

type Props = {
  caseId: string;
  current: {
    url: string | null;
    alt: string;
    caption: string;
    sourceName: string;
    sourceUrl: string;
  };
};

/** 長辺 2400px の WebP に変換して送信する（16:9 の本文幅表示に十分な大きさ） */
const MAX_EDGE = 2400;

export function CaseImagePanel({ caseId, current }: Props) {
  const [state, formAction, pending] = useActionState(saveCaseImage, { ok: false } as ActionState);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ alt: current.alt, caption: current.caption, sourceName: current.sourceName, sourceUrl: current.sourceUrl });
  const bind = (key: keyof typeof meta) => ({
    name: key,
    value: meta[key],
    onChange: (e: { target: { value: string } }) => setMeta((m) => ({ ...m, [key]: e.target.value })),
  });

  async function handleFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    const problem = checkSelectedFile(file, caseImageRule);
    if (problem) return setFileError(problem);
    setProcessing(true);
    try {
      const prepared = await prepareImage(file, { rule: caseImageRule, maxEdge: MAX_EDGE });
      if (image) URL.revokeObjectURL(image.previewUrl);
      setImage(prepared);
    } catch (e) {
      setFileError(e instanceof PrepareImageError ? e.message : "画像を処理できませんでした。");
    } finally {
      setProcessing(false);
    }
  }

  function submit(formData: FormData) {
    if (image) formData.set("image", image.blob, "image");
    formAction(formData);
  }

  const previewUrl = image?.previewUrl ?? current.url;

  return (
    <Fieldset legend="メイン画像" description="タイトル直下に本文幅・16:9で表示されます。未登録の場合は画像エリア自体が表示されません。">
      <ActionResult state={state} />
      <form action={submit} className="space-y-5">
        <input type="hidden" name="caseId" value={caseId} />

        {previewUrl ? (
          <div>
            <p className={labelClass}>{image ? "新しい画像（保存すると差し替わります）" : "現在の画像"}</p>
            <div className="mt-1.5 aspect-video overflow-hidden rounded-xl ring-1 ring-line-strong">
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <p className={hintClass}>表示時は16:9で上下（または左右）が切り取られます。</p>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-line-strong p-6 text-center text-xs text-slate-500">画像は登録されていません。</p>
        )}

        <div>
          <label className={labelClass} htmlFor="case-image-file">{current.url ? "画像を差し替える" : "画像をアップロード"}</label>
          <input
            id="case-image-file"
            type="file"
            accept={caseImageRule.mimeTypes.join(",")}
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={processing || pending}
            className="mt-1.5 block w-full text-xs text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/15 file:px-3 file:py-2 file:text-cyan-100 hover:file:bg-cyan-500/25"
          />
          {fileError ? (
            <p className={errorClass}>{fileError}</p>
          ) : (
            <p className={hintClass}>
              {processing ? "画像を処理しています…" : "JPEG / PNG / WebP・10MBまで。WebPへの変換・縮小・撮影位置などの情報（EXIF）の削除を自動で行います。横長（16:9）の画像がおすすめです。"}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>代替テキスト（alt）<span className="ml-1 font-normal text-rose-300/80">必須</span></span>
            <input {...bind("alt")} required maxLength={300} placeholder="画像の内容を短く説明" className={inputClass} />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>キャプション</span>
            <input {...bind("caption")} maxLength={300} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>出典名</span>
            <input {...bind("sourceName")} maxLength={300} placeholder="例：環境省" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>出典URL</span>
            <input {...bind("sourceUrl")} type="url" placeholder="https://" className={`${inputClass} font-mono`} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending || processing} className={primaryButtonClass}>
            {pending ? "保存中…" : "画像を保存"}
          </button>
          {image && (
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(image.previewUrl);
                setImage(null);
              }}
              className={secondaryButtonClass}
            >
              選択を取り消す
            </button>
          )}
          {current.url && (
            <span className="ml-auto">
              <ConfirmButton
                label="画像を削除"
                confirmLabel="削除する"
                description="メイン画像を削除します。元に戻せません。"
                onConfirm={() => removeCaseImage(caseId)}
              />
            </span>
          )}
        </div>
      </form>
    </Fieldset>
  );
}
