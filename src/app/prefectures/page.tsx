import type { Metadata } from "next";
import Link from "next/link";
import { JapanMapIcon } from "@/components/info/JapanMapIcon";
import { listCasesByPrefecture } from "@/lib/cases/by-prefecture";
import { OTHER_AREA, prefectureAreas } from "@/lib/prefectures";

export const metadata: Metadata = {
  title: "都道府県から探す",
  description: "掲載情報を都道府県別に一覧できます。動物虐待者情報・悪徳動物関連事業者・優良動物関連事業者のすべてを含みます。",
};

export default async function Page() {
  const groups = await listCasesByPrefecture();
  const countOf = (slug: string) => groups.get(slug)?.length ?? 0;
  const otherCount = countOf(OTHER_AREA.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-section">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 left-0 h-56 w-[36rem] max-w-full rounded-full bg-cyan-500/[0.07] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <nav aria-label="パンくずリスト" className="text-xs text-slate-500">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-cyan-200">TOP</Link>
              </li>
              <li aria-hidden="true" className="text-slate-600">/</li>
              <li aria-current="page" className="text-slate-300">都道府県から探す</li>
            </ol>
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/25">
              <JapanMapIcon />
            </span>
            <h1 className="text-2xl font-bold tracking-wide text-slate-50 md:text-3xl">都道府県から探す</h1>
          </div>
          <div className="mt-5 h-0.5 w-32 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-400/40 to-transparent" aria-hidden="true" />
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            都道府県を選ぶと、その地域の掲載情報（動物虐待者情報・悪徳動物関連事業者・優良動物関連事業者）を一覧できます。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {prefectureAreas.map((area) => (
          <div key={area.name}>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500" aria-hidden="true" />
              <h2 className="shrink-0 text-lg font-bold tracking-wide text-slate-50">{area.name}</h2>
              <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" aria-hidden="true" />
            </div>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {area.prefectures.map((prefecture) => {
                const count = countOf(prefecture.slug);
                return (
                  <li key={prefecture.slug}>
                    <Link
                      href={`/prefectures/${prefecture.slug}`}
                      className="panel panel-glow group flex items-center justify-between rounded-lg px-4 py-3 text-sm"
                    >
                      <span className={`font-semibold transition-colors group-hover:text-cyan-100 ${count > 0 ? "text-slate-100" : "text-slate-400"}`}>
                        {prefecture.name}
                      </span>
                      <span className={`font-mono text-xs ${count > 0 ? "text-cyan-300" : "text-slate-600"}`}>
                        {count}
                        <span className="ml-0.5 font-sans">件</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-slate-400 to-slate-600" aria-hidden="true" />
            <h2 className="shrink-0 text-lg font-bold tracking-wide text-slate-50">{OTHER_AREA.name}</h2>
            <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" aria-hidden="true" />
          </div>
          <Link
            href={`/prefectures/${OTHER_AREA.slug}`}
            className="panel panel-glow group flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm"
          >
            <span className="text-slate-300 transition-colors group-hover:text-cyan-100">
              複数の都道府県にまたがる情報や、地域を特定の都道府県に分類できない情報
            </span>
            <span className={`font-mono text-xs ${otherCount > 0 ? "text-cyan-300" : "text-slate-600"}`}>
              {otherCount}
              <span className="ml-0.5 font-sans">件</span>
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
