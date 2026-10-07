import type { Metadata } from "next";
import Link from "next/link";
import { InfoCardGrid } from "@/components/info/InfoCardGrid";
import { SearchForm } from "@/components/search/SearchForm";
import { searchCaseSummaries } from "@/lib/cases";
import { normalizeSearchQuery } from "@/lib/search";

export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const { query } = normalizeSearchQuery((await props.searchParams).q);
  return {
    title: query ? `「${query}」の検索結果` : "検索",
    // 検索結果ページは検索エンジンに登録しない
    robots: { index: false, follow: true },
  };
}

export default async function Page(props: PageProps<"/search">) {
  const { query, terms } = normalizeSearchQuery((await props.searchParams).q);
  const items = terms.length > 0 ? await searchCaseSummaries(terms) : [];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-section">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-12">
          <nav aria-label="パンくずリスト" className="text-xs text-slate-500">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-cyan-200">TOP</Link>
              </li>
              <li aria-hidden="true" className="text-slate-600">/</li>
              <li aria-current="page" className="text-slate-300">検索</li>
            </ol>
          </nav>
          <h1 className="mt-5 text-2xl font-bold tracking-wide text-slate-50 md:text-3xl">
            {query ? <>“{query}” の検索結果</> : "事案を検索"}
          </h1>
          <div className="mt-5 h-0.5 w-32 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-400/40 to-transparent" aria-hidden="true" />
          <SearchForm key={query} defaultValue={query} className="mt-6 max-w-2xl" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {terms.length === 0 ? (
          <p className="panel rounded-xl border-dashed p-10 text-center text-sm text-slate-400">
            名前・事業者名・地域・事案タイトルなどの検索語を入力してください。
          </p>
        ) : items.length === 0 ? (
          <NoResults />
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-300" aria-live="polite">
              <span className="font-mono text-base text-slate-50">{items.length}</span>件見つかりました
              {items.length >= 100 && <span className="ml-2 text-xs text-slate-500">（表示は新しい順に100件まで）</span>}
            </p>
            <InfoCardGrid items={items} showCategory />
          </>
        )}
      </section>
    </>
  );
}

function NoResults() {
  return (
    <div className="panel space-y-5 rounded-xl p-8 text-center">
      <p className="text-base font-semibold text-slate-100">該当する情報は見つかりませんでした。</p>
      <ul className="mx-auto max-w-md space-y-1.5 text-left text-sm text-slate-400">
        <li>・表記を変えて検索してください（例：「埼玉県川口市」→「川口」、漢字・カタカナの違い）</li>
        <li>・語を減らすと見つかりやすくなります（複数の語はすべてを含む事案を探します）</li>
      </ul>
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <Link href="/prefectures" className="rounded-lg px-4 py-2 font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-300/30 transition hover:bg-cyan-400/10">
          都道府県から探す
        </Link>
        <Link href="/#categories" className="rounded-lg px-4 py-2 font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-300/30 transition hover:bg-cyan-400/10">
          カテゴリから探す
        </Link>
      </div>
    </div>
  );
}
