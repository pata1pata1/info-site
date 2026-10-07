import { JapanMapIcon } from "@/components/info/JapanMapIcon";
import { SearchForm } from "@/components/search/SearchForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RichText } from "@/components/ui/RichText";
import type { HomeContent } from "@/lib/cms/types";

export function HeroSection({ home }: { home: HomeContent }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-section">
      {/* 背景装飾（下から）：背景画像 → 濃紺オーバーレイ → グリッド → 淡い光 */}
      <div className="hero-art pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="hero-overlay pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-cyan-400/[0.07] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center md:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/5 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-cyan-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgb(103_232_249/0.8)]" aria-hidden="true" />
          ANIMAL WELFARE INFORMATION
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-wide text-slate-50 md:text-6xl">
          {home.siteName}
        </h1>
        <div className="glow-line mt-6 w-40 md:w-56" aria-hidden="true" />
        <p className="mt-6 text-lg font-medium tracking-[0.15em] text-cyan-100 md:text-2xl">
          {home.tagline}
        </p>
        <RichText source={home.description} className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base" />

        {/* スマホでは縦に並べて幅をそろえ、sm 以上では横並び */}
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
          <ButtonLink href="#categories" variant="primary" icon={<GridIcon />}>
            カテゴリから探す
          </ButtonLink>
          <ButtonLink href="/prefectures" icon={<JapanMapIcon />}>
            都道府県から探す
          </ButtonLink>
          <ButtonLink href="#recent" icon={<ClockIcon />}>
            {home.recentTitle}
          </ButtonLink>
        </div>

        {/* 事案検索（スマホでは横幅いっぱい） */}
        <SearchForm className="mt-6 max-w-xl" />
      </div>
    </section>
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

function GridIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4.5V12l3 2" />
    </svg>
  );
}
