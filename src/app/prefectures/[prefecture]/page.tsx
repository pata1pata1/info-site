import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/info/CategoryIcon";
import { InfoCardGrid } from "@/components/info/InfoCardGrid";
import { JapanMapIcon } from "@/components/info/JapanMapIcon";
import { listCasesByPrefecture } from "@/lib/cases/by-prefecture";
import { getPrefecture, OTHER_AREA, prefectures } from "@/lib/prefectures";
import { categories } from "@/lib/site";

// 47都道府県と「その他・広域」以外の URL は 404
export const dynamicParams = false;

export function generateStaticParams() {
  return [...prefectures, OTHER_AREA].map((p) => ({ prefecture: p.slug }));
}

function resolveArea(slug: string) {
  return slug === OTHER_AREA.slug ? OTHER_AREA : getPrefecture(slug);
}

export async function generateMetadata(props: PageProps<"/prefectures/[prefecture]">): Promise<Metadata> {
  const { prefecture } = await props.params;
  const area = resolveArea(prefecture);
  if (!area) return {};
  return {
    title: `${area.name}の掲載情報`,
    description: `${area.name}に関する動物虐待者情報・悪徳動物関連事業者・優良動物関連事業者の掲載情報の一覧です。`,
  };
}

export default async function Page(props: PageProps<"/prefectures/[prefecture]">) {
  const { prefecture } = await props.params;
  const area = resolveArea(prefecture);
  if (!area) notFound();

  const items = (await listCasesByPrefecture()).get(area.slug) ?? [];
  const isOther = area.slug === OTHER_AREA.slug;

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
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-cyan-200">TOP</Link>
              </li>
              <li aria-hidden="true" className="text-slate-600">/</li>
              <li>
                <Link href="/prefectures" className="transition-colors hover:text-cyan-200">都道府県から探す</Link>
              </li>
              <li aria-hidden="true" className="text-slate-600">/</li>
              <li aria-current="page" className="text-slate-300">{area.name}</li>
            </ol>
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/25">
              <JapanMapIcon />
            </span>
            <h1 className="text-2xl font-bold tracking-wide text-slate-50 md:text-3xl">{area.name}の掲載情報</h1>
          </div>
          <div className="mt-5 h-0.5 w-32 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-400/40 to-transparent" aria-hidden="true" />
          {isOther && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-300">
              複数の都道府県にまたがる情報や、地域を特定の都道府県に分類できない情報（「九州・沖縄」「全国」など）を掲載しています。
            </p>
          )}

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug} className="panel flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${category.theme.iconBg}`}>
                  <CategoryIcon slug={category.slug} size={18} />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-200">{category.name}</span>
                <span className="text-sm text-slate-500">
                  <span className="font-mono text-base text-slate-100">
                    {items.filter((item) => item.category === category.slug).length}
                  </span>
                  件
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500" aria-hidden="true" />
          <h2 className="shrink-0 text-lg font-bold tracking-wide text-slate-50">情報一覧</h2>
          <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" aria-hidden="true" />
          <p className="shrink-0 text-sm text-slate-500">
            <span className="font-mono text-slate-300">{items.length}</span>件
          </p>
        </div>
        <InfoCardGrid items={items} showCategory emptyMessage="現在、掲載情報はありません。" />
      </section>
    </>
  );
}
