"use client";

/* eslint-disable @next/next/no-img-element -- blob: URL と Storage の公開URLを表示する */

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { deleteCaseImage, saveCaseImages, uploadCaseImage } from "@/lib/admin/case-actions";
import { MAX_CASE_IMAGES, caseImageRule } from "@/lib/media/config";
import { checkSelectedFile, prepareImage, PrepareImageError, type PreparedImage } from "@/lib/media/prepare-image";
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { ActionResult, ConfirmButton, Fieldset } from "./ui";

export type AdminCaseImage = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  source_name: string;
  source_url: string;
};

type Meta = Pick<AdminCaseImage, "alt" | "caption" | "source_name" | "source_url">;
type Pending = PreparedImage & { meta: Meta };

/** 長辺 2400px の WebP に変換して送信する */
const MAX_EDGE = 2400;
const emptyMeta: Meta = { alt: "", caption: "", source_name: "", source_url: "" };

type Props = {
  caseId: string;
  images: AdminCaseImage[];
  /** case_images テーブル未作成（マイグレーション未実行）のときのエラー */
  loadError?: string;
};

/** 案件画像（複数枚）の管理：追加・プレビュー・並び替え・削除・画像ごとの alt / キャプション / 出典 */
export function CaseImagesPanel({ caseId, images, loadError }: Props) {
  const router = useRouter();
  const [saveState, saveAction, saving] = useActionState(saveCaseImages, { ok: false } as ActionState);

  // 登録済み画像の編集内容。サーバーから新しい一覧が届いたら、編集中の内容を保ったまま反映する
  const [items, setItems] = useState(images);
  const [seenImages, setSeenImages] = useState(images);
  if (images !== seenImages) {
    setSeenImages(images);
    setItems((prev) => {
      const edited = new Map(prev.map((i) => [i.id, i]));
      const kept = prev.filter((i) => images.some((n) => n.id === i.id));
      const added = images.filter((n) => !edited.has(n.id));
      return [...kept, ...added];
    });
  }

  const [pending, setPending] = useState<Pending[]>([]);
  const [processing, setProcessing] = useState(false);
  const [uploading, startUpload] = useTransition();
  const [uploadState, setUploadState] = useState<ActionState>({ ok: false });
  const [progress, setProgress] = useState("");
  const remaining = MAX_CASE_IMAGES - items.length - pending.length;

  async function handleFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    const messages: string[] = [];
    if (files.length > remaining) messages.push(`画像は1事案あたり${MAX_CASE_IMAGES}枚までです。超えた分は追加していません。`);
    setProcessing(true);
    const added: Pending[] = [];
    for (const file of files.slice(0, Math.max(0, remaining))) {
      const problem = checkSelectedFile(file, caseImageRule);
      if (problem) {
        messages.push(problem);
        continue;
      }
      try {
        added.push({ ...(await prepareImage(file, { rule: caseImageRule, maxEdge: MAX_EDGE })), meta: { ...emptyMeta } });
      } catch (e) {
        messages.push(e instanceof PrepareImageError ? e.message : `「${file.name}」を処理できませんでした。`);
      }
    }
    setProcessing(false);
    setPending((p) => [...p, ...added]);
    setUploadState(messages.length ? { ok: false, message: "一部の画像を追加できませんでした。", errors: messages } : { ok: false });
  }

  function removePending(id: string) {
    setPending((p) => {
      const target = p.find((x) => x.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return p.filter((x) => x.id !== id);
    });
  }

  function uploadAll() {
    const missingAlt = pending.findIndex((p) => !p.meta.alt.trim());
    if (missingAlt >= 0) {
      setUploadState({ ok: false, message: `追加する画像${missingAlt + 1}の代替テキスト（alt）を入力してください。` });
      return;
    }
    startUpload(async () => {
      const queue = [...pending];
      const failures: string[] = [];
      for (const [i, item] of queue.entries()) {
        setProgress(`${i + 1} / ${queue.length} 枚目を送信中…`);
        const fd = new FormData();
        fd.set("caseId", caseId);
        fd.set("image", item.blob, "image");
        Object.entries(item.meta).forEach(([k, v]) => fd.set(k, v));
        const result = await uploadCaseImage(fd);
        if (result.ok) {
          URL.revokeObjectURL(item.previewUrl);
          setPending((p) => p.filter((x) => x.id !== item.id));
        } else {
          failures.push(`${item.originalName}：${result.message}${result.errors ? ` ${result.errors.join(" ")}` : ""}`);
        }
      }
      setProgress("");
      setUploadState(
        failures.length
          ? { ok: false, message: "一部の画像を保存できませんでした。", errors: failures }
          : { ok: true, message: `${queue.length}枚の画像を追加しました。` },
      );
      router.refresh();
    });
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };
  const updateItem = (id: string, meta: Partial<Meta>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...meta } : i)));

  if (loadError) {
    return (
      <Fieldset legend="2. 事案画像">
        <p className="rounded-lg bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100 ring-1 ring-inset ring-amber-300/25">
          画像一覧を読み込めませんでした。Supabase で <code className="font-mono">20261007000004_case_images.sql</code> を実行済みか確認してください。（{loadError}）
        </p>
      </Fieldset>
    );
  }

  return (
    <Fieldset
      legend="2. 事案画像"
      description={`タイトル直下のギャラリーに、この並び順で表示されます（最大${MAX_CASE_IMAGES}枚）。公開ページでは画像をトリミングせず全体を表示します。1枚目が最初に表示されます。`}
    >
      {/* 登録済みの画像 */}
      <div className="space-y-3">
        <p className={labelClass}>登録済みの画像（{items.length}枚）</p>
        {items.length === 0 && <p className="rounded-lg border border-dashed border-line-strong p-5 text-center text-xs text-slate-500">画像は登録されていません。未登録の場合、公開ページに画像エリアは表示されません。</p>}
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={item.id} className="grid gap-3 rounded-lg border border-line bg-night-2/40 p-3 sm:grid-cols-[9rem_1fr]">
              <div className="flex flex-col gap-2">
                <a href={item.url} target="_blank" className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-night ring-1 ring-line-strong">
                  <img src={item.url} alt="" className="max-h-full max-w-full object-contain" />
                </a>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs text-cyan-300">#{i + 1}</span>
                  <span className="ml-auto" />
                  <IconButton label={`画像${i + 1}を上へ`} onClick={() => move(i, i - 1)} disabled={i === 0}>↑</IconButton>
                  <IconButton label={`画像${i + 1}を下へ`} onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>↓</IconButton>
                </div>
              </div>
              <div className="space-y-2">
                <MetaFields meta={item} onChange={(m) => updateItem(item.id, m)} />
                <div className="flex justify-end">
                  <ConfirmButton
                    label="この画像を削除"
                    confirmLabel="削除する"
                    description="画像ファイルも削除します。元に戻せません。"
                    onConfirm={async () => {
                      const result = await deleteCaseImage(item.id);
                      if (result.ok) router.refresh();
                      return result;
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
        {items.length > 0 && (
          <form action={saveAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="caseId" value={caseId} />
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(items.map(({ id, alt, caption, source_name, source_url }) => ({ id, alt, caption, source_name, source_url })))}
            />
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "保存中…" : "画像の情報と並び順を保存"}
            </button>
            <span className="text-xs text-slate-500">alt・キャプション・出典の変更や並び替えは、このボタンで保存されます。</span>
          </form>
        )}
        <ActionResult state={saveState} />
      </div>

      {/* 画像の追加 */}
      <div className="space-y-3 border-t border-line pt-5">
        <p className={labelClass}>画像を追加</p>
        {remaining > 0 ? (
          <label className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-300/30 bg-cyan-400/[0.03] p-5 text-center text-xs text-cyan-200/80 transition hover:border-cyan-300/60 hover:bg-cyan-400/[0.07] ${processing || uploading ? "pointer-events-none opacity-50" : ""}`}>
            {processing ? "画像を処理しています…" : "クリックして画像を選択（複数可）"}
            <input type="file" multiple accept={caseImageRule.mimeTypes.join(",")} onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} className="sr-only" />
          </label>
        ) : (
          <p className="text-xs text-amber-200">登録できる上限（{MAX_CASE_IMAGES}枚）に達しています。</p>
        )}
        <p className={hintClass}>
          JPEG / PNG / WebP・1枚10MBまで。WebP への変換・縮小（長辺2400px）・撮影位置などの情報（EXIF）の削除を自動で行います。トリミングはしません。
        </p>

        {pending.length > 0 && (
          <>
            <ol className="space-y-3">
              {pending.map((item, i) => (
                <li key={item.id} className="grid gap-3 rounded-lg border border-cyan-300/20 bg-cyan-400/[0.03] p-3 sm:grid-cols-[9rem_1fr]">
                  <div className="flex flex-col gap-2">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-night ring-1 ring-line-strong">
                      <img src={item.previewUrl} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="truncate text-[11px] text-slate-500">追加{i + 1}：{item.originalName}</span>
                  </div>
                  <div className="space-y-2">
                    <MetaFields
                      meta={item.meta}
                      onChange={(m) => setPending((p) => p.map((x) => (x.id === item.id ? { ...x, meta: { ...x.meta, ...m } } : x)))}
                    />
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removePending(item.id)} disabled={uploading} className="text-xs text-slate-400 hover:text-rose-300">
                        追加をやめる
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={uploadAll} disabled={uploading || processing} className={primaryButtonClass}>
                {uploading ? progress || "送信中…" : `${pending.length}枚をアップロード`}
              </button>
              <button
                type="button"
                onClick={() => pending.forEach((p) => removePending(p.id))}
                disabled={uploading}
                className={secondaryButtonClass}
              >
                すべて取り消す
              </button>
            </div>
          </>
        )}
        <ActionResult state={uploadState} />
      </div>
    </Fieldset>
  );
}

function MetaFields({ meta, onChange }: { meta: Meta; onChange: (meta: Partial<Meta>) => void }) {
  const field = (key: keyof Meta) => ({
    value: meta[key],
    onChange: (e: { target: { value: string } }) => onChange({ [key]: e.target.value }),
  });
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="text-[11px] text-slate-400">代替テキスト（alt）<span className="ml-1 text-rose-300/80">必須</span></span>
        <input {...field("alt")} maxLength={300} placeholder="画像の内容を短く説明" className={`${inputClass} mt-1`} />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-[11px] text-slate-400">キャプション</span>
        <input {...field("caption")} maxLength={300} className={`${inputClass} mt-1`} />
      </label>
      <label className="block">
        <span className="text-[11px] text-slate-400">出典名</span>
        <input {...field("source_name")} maxLength={300} placeholder="例：環境省" className={`${inputClass} mt-1`} />
      </label>
      <label className="block">
        <span className="text-[11px] text-slate-400">出典URL</span>
        <input {...field("source_url")} type="url" placeholder="https://" className={`${inputClass} mt-1 font-mono`} />
      </label>
    </div>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded text-slate-400 ring-1 ring-inset ring-line-strong hover:text-cyan-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
