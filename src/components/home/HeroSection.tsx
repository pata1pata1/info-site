import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* 背景装飾：グリッド＋淡い光 */}
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center md:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/5 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-cyan-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgb(103_232_249/0.8)]" aria-hidden="true" />
          ANIMAL WELFARE INFORMATION
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-wide text-slate-50 md:text-6xl">
          {siteConfig.name}
        </h1>
        <div className="glow-line mt-6 w-40 md:w-56" aria-hidden="true" />
        <p className="mt-6 text-lg font-medium tracking-[0.15em] text-cyan-100/90 md:text-2xl">
          {siteConfig.tagline}
        </p>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
          {siteConfig.description}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="#categories"
            className="inline-flex items-center rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-500/25 hover:shadow-[0_0_24px_-6px_rgb(34_211_238/0.55)]"
          >
            カテゴリから探す
          </Link>
          <Link
            href="#recent"
            className="panel inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-line-strong hover:text-white"
          >
            最近追加された情報
          </Link>
        </div>
      </div>
    </section>
  );
}
