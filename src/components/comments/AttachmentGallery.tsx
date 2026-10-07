"use client";

/* eslint-disable @next/next/no-img-element -- 期限付き署名URLを毎回発行するため next/image の最適化・キャッシュは使わない */

import { useCallback, useEffect, useRef, useState } from "react";
import type { CommentAttachment } from "@/lib/comments/types";

/** 添付画像のサムネイル一覧と拡大表示（PC：クリック／Esc・矢印キー、スマホ：タップ） */
type Props = {
  attachments: CommentAttachment[];
  /** 調査中など、未確認の情報である旨を拡大表示にも出す */
  unverified: boolean;
};

export function AttachmentGallery({ attachments, unverified }: Props) {
  const items = attachments.filter((a) => a.url);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);
  const move = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [move]);

  if (items.length === 0) return null;
  const current = index === null ? null : items[index];

  return (
    <>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => open(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg ring-1 ring-inset ring-line-strong transition hover:ring-cyan-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label={`添付画像${i + 1}を拡大表示`}
            >
              <img
                src={item.url!}
                alt={item.description ?? `添付画像${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/50 to-transparent opacity-0 transition group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          // 画像以外（背景）のクリックで閉じる
          if (e.target === e.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-night/90 backdrop:backdrop-blur-sm"
        aria-label="添付画像の拡大表示"
      >
        {current && index !== null && (
          <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-300">
              <span className="font-mono text-xs text-cyan-200/80">
                {index + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-200 ring-1 ring-inset ring-line-strong hover:bg-white/10"
                aria-label="閉じる"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16"
              onClick={(e) => e.target === e.currentTarget && close()}
            >
              <img
                src={current.url!}
                alt={current.description ?? `添付画像${index + 1}`}
                width={current.width ?? undefined}
                height={current.height ?? undefined}
                className="max-h-full max-w-full rounded-lg object-contain shadow-[0_0_48px_-12px_rgb(34_211_238/0.35)] ring-1 ring-line-strong"
              />
              {items.length > 1 && (
                <>
                  <NavButton side="left" onClick={() => move(-1)} />
                  <NavButton side="right" onClick={() => move(1)} />
                </>
              )}
            </div>
            {unverified && (
              <p className="px-4 pb-4 text-center text-xs text-amber-200/80">ユーザーから提供された未確認の画像です。</p>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "前の画像" : "次の画像"}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-night/70 text-slate-100 ring-1 ring-inset ring-line-strong backdrop-blur hover:bg-cyan-500/20 ${
        side === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
