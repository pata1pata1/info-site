import Link from "next/link";
import { RichText } from "@/components/ui/RichText";
import { listCaseSummaries } from "@/lib/cases";
import { getSiteContent } from "@/lib/cms/content";
import { getCategory, type CategorySlug } from "@/lib/site";
import { InfoCardGrid } from "./InfoCardGrid";
import { CategoryIcon } from "./CategoryIcon";
import { CaseNotice } from "@/components/case/CaseNotice";

/** 各カテゴリページ共通のテンプレート（ページタイトル・説明・情報一覧・掲載方針） */
export async function CategoryPage({ slug }: { slug: CategorySlug }) {
  const category = getCategory(slug);
  const [content, items] = await Promise.all([getSiteContent(), listCaseSummaries(slug)]);
  const text = content.categories[slug];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
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
              <li aria-current="page" className="text-slate-300">{text.title}</li>
            </ol>
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${category.theme.iconBg}`}>
              <CategoryIcon slug={slug} />
            </span>
            <h1 className="text-2xl font-bold tracking-wide text-slate-50 md:text-3xl">{text.title}</h1>
          </div>
          <div className={`mt-5 h-0.5 w-32 rounded-full ${category.theme.accentBar}`} aria-hidden="true" />
          <RichText source={text.description} className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base" />
          {text.supplement && (
            <RichText source={text.supplement} className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-400 md:text-sm" />
          )}
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
        {/* TODO: 地域・事業者名・人物名・動物種別・投稿日・ステータスでの絞り込みをここに追加予定 */}
        <InfoCardGrid items={items} />
      </section>

      {/* その他のコンテンツはこの上に追加し、NOTICE / 掲載方針は常にページ最下部に置く */}
      {text.policy.trim() && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <CaseNotice text={text.policy} />
        </section>
      )}
    </>
  );
}
