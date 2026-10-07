"use client";

/* eslint-disable @next/next/no-img-element -- Supabase Storage の公開URLをそのまま表示する（next/image のドメイン設定を不要にするため） */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CaseImage } from "@/lib/cases";

/** PC・タブレット（幅 640px 以上 = Tailwind の sm）は2枚ずつ、スマホは1枚ずつ表示する */
const WIDE_QUERY = "(min-width: 640px)";

function usePerPage(): 1 | 2 {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(WIDE_QUERY);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => (window.matchMedia(WIDE_QUERY).matches ? 2 : 1),
    // サーバー描画時は PC 表示として出力し、ブラウザで画面幅に合わせて切り替える
    () => 2,
  );
}

/**
 * 案件画像ギャラリー（ページ送り）。
 * - PC：1画面に2枚（同じ大きさの枠）、スマホ：1画面に1枚（画面幅に合わせる）
 * - 表示枚数を超える分は「前へ」「次へ」（またはキーボードの左右キー）で切り替える
 * - 画像はトリミングせず全体を表示する（object-contain）
 * - クリック・タップで拡大表示（拡大時もトリミングしない）
 */
export function CaseGallery({ images }: { images: CaseImage[] }) {
  const perPage = usePerPage();
  const [start, setStart] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = images.length;

  // 画面幅が変わって1ページの枚数が変わっても、表示中の画像を含むページに揃える
  const first = Math.min(Math.floor(start / perPage) * perPage, Math.max(0, total - 1));
  const visible = images.slice(first, first + perPage);
  const last = first + visible.length;
  const hasPrev = first > 0;
  const hasNext = last < total;
  const paged = total > perPage;

  const goPrev = useCallback(() => setStart((s) => Math.max(0, Math.floor(s / perPage) * perPage - perPage)), [perPage]);
  const goNext = useCallback(
    () => setStart((s) => Math.min(Math.floor(s / perPage) * perPage + perPage, total - 1)),
    [perPage, total],
  );

  const openZoom = (index: number) => {
    setZoomIndex(index);
    dialogRef.current?.showModal();
  };
  const moveZoom = useCallback(
    (delta: number) => setZoomIndex((i) => (i === null ? i : (i + delta + total) % total)),
    [total],
  );

  // 拡大表示を閉じたら、最後に見ていた画像を含むページを表示する。
  // ×・背景クリック・Esc のすべてをこの関数で閉じる（ブラウザの close イベントには頼らない）
  const zoomIndexRef = useRef<number | null>(null);
  useEffect(() => {
    zoomIndexRef.current = zoomIndex;
  }, [zoomIndex]);
  const closeZoom = useCallback(() => {
    const index = zoomIndexRef.current;
    dialogRef.current?.close();
    if (index !== null) setStart(index);
    setZoomIndex(null);
  }, []);

  // 拡大表示中のキー操作：Esc で閉じる、左右キーで前後の画像へ
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeZoom();
      }
      if (total < 2) return;
      if (e.key === "ArrowRight") moveZoom(1);
      if (e.key === "ArrowLeft") moveZoom(-1);
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [closeZoom, moveZoom, total]);

  if (total === 0) return null;
  const zoomed = zoomIndex === null ? null : images[zoomIndex];
  const counter = visible.length > 1 ? `${first + 1} - ${last} / ${total}` : `${first + 1} / ${total}`;

  return (
    <section
      className="mt-6"
      aria-roledescription="画像ギャラリー"
      aria-label="案件画像"
      onKeyDown={(e) => {
        if (!paged) return;
        if (e.key === "ArrowRight" && hasNext) goNext();
        if (e.key === "ArrowLeft" && hasPrev) goPrev();
      }}
    >
      <ul className={total === 1 ? "mx-auto max-w-xl" : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"} aria-live="polite">
        {visible.map((image, i) => (
          <li key={image.id ?? image.url}>
            <figure>
              <button
                type="button"
                onClick={() => openZoom(first + i)}
                aria-label={`画像${first + i + 1}を拡大表示`}
                className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-night-2/80 p-2 ring-1 ring-line-strong transition hover:ring-cyan-300/50 hover:shadow-[0_8px_32px_-12px_rgb(34_211_238/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="max-h-full max-w-full object-contain"
                />
                <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-night/75 px-2 py-0.5 text-[10px] text-slate-300 opacity-80 ring-1 ring-inset ring-line-strong backdrop-blur transition group-hover:opacity-100">
                  ⤢ 拡大
                </span>
              </button>
              <ImageCaption image={image} />
            </figure>
          </li>
        ))}
      </ul>

      {paged && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <PageButton direction="prev" onClick={goPrev} disabled={!hasPrev} />
          <span className="min-w-24 text-center font-mono text-xs tracking-wider text-cyan-200/80" aria-live="polite">
            {counter}
          </span>
          <PageButton direction="next" onClick={goNext} disabled={!hasNext} />
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === e.currentTarget && closeZoom()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-night/90 backdrop:backdrop-blur-sm"
        aria-label="案件画像の拡大表示"
      >
        {zoomed && zoomIndex !== null && (
          <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && closeZoom()}>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-xs text-cyan-200/80">{total > 1 ? `${zoomIndex + 1} / ${total}` : ""}</span>
              <button
                type="button"
                onClick={closeZoom}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-200 ring-1 ring-inset ring-line-strong hover:bg-white/10"
                aria-label="閉じる"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
              onClick={(e) => e.target === e.currentTarget && closeZoom()}
            >
              <img
                src={zoomed.url}
                alt={zoomed.alt}
                width={zoomed.width}
                height={zoomed.height}
                className="h-auto max-h-full w-auto max-w-full rounded-lg object-contain ring-1 ring-line-strong"
              />
              {total > 1 && (
                <>
                  <ZoomNav side="left" onClick={() => moveZoom(-1)} />
                  <ZoomNav side="right" onClick={() => moveZoom(1)} />
                </>
              )}
            </div>
            <div className="mx-auto w-full max-w-3xl px-4 pb-4">
              <ImageCaption image={zoomed} />
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

function PageButton({ direction, onClick, disabled }: { direction: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  const prev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={prev ? "前の画像へ" : "次の画像へ"}
      className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-300/30 transition hover:bg-cyan-400/10 hover:ring-cyan-300/60 disabled:cursor-not-allowed disabled:text-slate-600 disabled:ring-line disabled:hover:bg-transparent"
    >
      {prev && <Chevron side="left" />}
      {prev ? "前へ" : "次へ"}
      {!prev && <Chevron side="right" />}
    </button>
  );
}

function Chevron({ side }: { side: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function ImageCaption({ image }: { image: CaseImage }) {
  if (!image.caption && !image.sourceName) return null;
  return (
    <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1 text-xs leading-relaxed text-slate-400">
      {image.caption && <span>{image.caption}</span>}
      {image.sourceName && (
        <span className="text-slate-500">
          出典：
          {image.sourceUrl ? (
            <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300/80 hover:text-cyan-200">
              {image.sourceName}
            </a>
          ) : (
            image.sourceName
          )}
        </span>
      )}
    </figcaption>
  );
}

/** 拡大表示の中で使う前後ボタン */
function ZoomNav({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "前の画像" : "次の画像"}
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-night/70 text-slate-100 ring-1 ring-inset ring-line-strong backdrop-blur transition hover:bg-cyan-500/20 ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      <Chevron side={side} />
    </button>
  );
}
