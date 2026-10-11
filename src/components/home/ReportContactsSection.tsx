"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * TOPページの公的通報先案内（折りたたみ式・初期状態は閉じる）。
 * 文言は環境省・警察庁の公的案内を基準にしている。
 */
const ENV_REPORT_URL = "https://www.env.go.jp/nature/dobutsu/aigo/3_contact/reportcruelty/";

export function ReportContactsSection() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section id="report" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12">
      {/* 見出しは SectionHeading と同じ見た目。開閉は右側の「通報先を見る」ボタンで行う */}
      <div className="flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500" aria-hidden="true" />
        <h2 className="shrink-0 text-xl font-bold tracking-wide text-slate-50">動物虐待を見かけたら</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" aria-hidden="true" />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-400/5 py-1.5 pl-4 pr-3 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-300/45 hover:bg-cyan-400/10 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          {open ? "閉じる" : "通報先を見る"}
          <ChevronIcon open={open} />
        </button>
      </div>

      {/* 0fr ↔ 1fr の grid-rows で高さを軽くアニメーション。閉じている間は inert でフォーカス・読み上げ対象から外す */}
      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="mb-6 mt-2 pl-4 text-sm text-slate-400">
            動物虐待を発見した場合や、その疑いがある場合は、状況に応じて警察または自治体の動物愛護担当窓口へ相談・通報してください。
          </p>

          <ul className="grid gap-5 md:grid-cols-3">
            {/* 緊急：110 のみローズ系で控えめに強調 */}
            <li>
              <a
                href="tel:110"
                className="panel group flex h-full flex-col overflow-hidden rounded-xl border-rose-400/30 transition-[border-color,box-shadow] duration-200 hover:border-rose-300/50 hover:shadow-[0_8px_28px_-14px_rgb(251_113_133/0.35)]"
              >
                <div className="h-0.5 w-full bg-gradient-to-r from-rose-400/80 via-rose-300/60 to-transparent" aria-hidden="true" />
                <div className="flex flex-1 flex-col px-6 py-4">
                  <CardLabel tone="rose">緊急の場合</CardLabel>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-300">
                    今まさに虐待が行われている、動物の生命に危険がある場合
                  </p>
                  <p className="mt-2.5 font-mono text-5xl font-bold tracking-wider text-rose-200 drop-shadow-[0_0_12px_rgb(251_113_133/0.35)]">
                    110
                  </p>
                  <CardFooter tone="rose">警察へ緊急通報</CardFooter>
                </div>
              </a>
            </li>

            <li>
              <a href="tel:%239110" className="panel panel-glow group flex h-full flex-col overflow-hidden rounded-xl">
                <div className="h-0.5 w-full bg-gradient-to-r from-cyan-300/70 via-blue-500/50 to-transparent" aria-hidden="true" />
                <div className="flex flex-1 flex-col px-6 py-4">
                  <CardLabel>緊急ではない警察相談</CardLabel>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-300">
                    動物虐待について警察に相談したい場合
                  </p>
                  <p className="mt-2.5 font-mono text-5xl font-bold tracking-wider text-slate-50">#9110</p>
                  <CardFooter>警察相談専用電話</CardFooter>
                </div>
              </a>
            </li>

            <li>
              <a
                href={ENV_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="panel panel-glow group flex h-full flex-col overflow-hidden rounded-xl"
              >
                <div className="h-0.5 w-full bg-gradient-to-r from-cyan-300/70 via-blue-500/50 to-transparent" aria-hidden="true" />
                <div className="flex flex-1 flex-col px-6 py-4">
                  <CardLabel>自治体へ相談</CardLabel>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-300">
                    虐待かどうか判断できない場合や、不適切な飼育が疑われる場合
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
                    <span className="font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200">
                      自治体の通報窓口を探す
                    </span>
                    <ExternalIcon />
                    <span className="sr-only">（外部サイト・新しいタブで開きます）</span>
                  </div>
                </div>
              </a>
            </li>
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            当サイトへの情報提供は、警察・行政機関への通報の代わりにはなりません。
            <br className="hidden sm:inline" />
            緊急性がある場合は、必ず公的機関へ直接ご連絡ください。
          </p>
        </div>
      </div>
    </section>
  );
}

function CardLabel({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "rose" }) {
  const styles =
    tone === "rose"
      ? "border-rose-300/30 bg-rose-400/[0.08] text-rose-200"
      : "border-cyan-300/20 bg-cyan-400/5 text-cyan-200/90";
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${styles}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${tone === "rose" ? "bg-rose-300 shadow-[0_0_8px_rgb(253_164_175/0.8)]" : "bg-cyan-300 shadow-[0_0_8px_rgb(103_232_249/0.8)]"}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

function CardFooter({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "rose" }) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
      <span className={`font-semibold ${tone === "rose" ? "text-rose-200" : "text-slate-200"}`}>{children}</span>
      <PhoneIcon className={tone === "rose" ? "text-rose-200" : "text-cyan-300"} />
    </div>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={`h-4 w-4 ${className ?? ""}`}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      {...iconProps}
      className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4 text-cyan-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}
