import type { Metadata } from "next";
import Link from "next/link";
import { CaseBulkPanel } from "@/components/admin/CaseBulkPanel";
import { primaryButtonClass } from "@/components/ui/form-styles";
import { requireAdminPage } from "@/lib/admin/auth";
import { loadAuditedCases } from "@/lib/admin/case-audit-data";
import { getSiteContent } from "@/lib/cms/content";
import { categories, type CategorySlug } from "@/lib/site";

export const metadata: Metadata = { title: "事案ページ" };

const statusFilters = [
  { value: "all", label: "すべて" },
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開中" },
] as const;
type StatusFilter = (typeof statusFilters)[number]["value"];

export default async function AdminCasesList(props: PageProps<"/admin/cases">) {
  const { supabase } = await requireAdminPage("/admin/cases");
  const searchParams = await props.searchParams;
  const category = categories.find((c) => c.slug === searchParams.category)?.slug;
  const status: StatusFilter = statusFilters.find((s) => s.value === searchParams.status)?.value ?? "all";

  const [{ rows, error }, content] = await Promise.all([loadAuditedCases(supabase), getSiteContent()]);

  const matchStatus = (s: StatusFilter, publishStatus: string) => s === "all" || publishStatus === s;
  const matchCategory = (c: CategorySlug | undefined, rowCategory: string) => !c || rowCategory === c;
  const visible = rows.filter((r) => matchStatus(status, r.publish_status) && matchCategory(category, r.category));

  const href = (next: { status?: StatusFilter; category?: CategorySlug }) => {
    const params = new URLSearchParams();
    const s = "status" in next ? next.status : status;
    const c = "category" in next ? next.category : category;
    if (s && s !== "all") params.set("status", s);
    if (c) params.set("category", c);
    const query = params.toString();
    return query ? `/admin/cases?${query}` : "/admin/cases";
  };

  // 件数：状態の件数は現在のカテゴリ内、カテゴリの件数は現在の状態内で数える
  const statusTabs = statusFilters.map((s) => ({
    href: href({ status: s.value }),
    label: s.label,
    count: rows.filter((r) => matchStatus(s.value, r.publish_status) && matchCategory(category, r.category)).length,
    active: status === s.value,
  }));
  const categoryTabs = [
    { href: href({ category: undefined }), label: "すべて", count: rows.filter((r) => matchStatus(status, r.publish_status)).length, active: !category },
    ...categories.map((c) => ({
      href: href({ category: c.slug }),
      label: content.categories[c.slug].title,
      count: rows.filter((r) => matchStatus(status, r.publish_status) && r.category === c.slug).length,
      active: category === c.slug,
    })),
  ];

  const categoryTitles = Object.fromEntries(categories.map((c) => [c.slug, content.categories[c.slug].title])) as Record<CategorySlug, string>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-50">事案ページ</h1>
        <Link href={`/admin/cases/new${category ? `?category=${category}` : ""}`} className={primaryButtonClass}>
          ＋ 新規作成
        </Link>
      </div>
      {searchParams.deleted === "1" && <p className="text-sm text-cyan-200">事案を削除しました。</p>}

      <div className="space-y-2">
        <FilterTabs label="公開状態で絞り込み" tabs={statusTabs} />
        <FilterTabs label="カテゴリで絞り込み" tabs={categoryTabs} />
      </div>

      {error && <p className="text-sm text-rose-300">読み込みに失敗しました：{error}</p>}

      {/* フィルターを変えたら選択をリセットする（非表示の案件が選択されたまま残らないようにする） */}
      <CaseBulkPanel key={`${status}:${category ?? "all"}`} rows={visible} categoryTitles={categoryTitles} />
    </div>
  );
}

function FilterTabs({ label, tabs }: { label: string; tabs: { href: string; label: string; count: number; active: boolean }[] }) {
  return (
    <nav className="flex flex-wrap gap-1 text-xs" aria-label={label}>
      {tabs.map((tab) => (
        <Link
          key={tab.href + tab.label}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={`rounded-md px-3 py-1.5 ${tab.active ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-300/25" : "text-slate-400 hover:text-slate-200"}`}
        >
          {tab.label}
          <span className="ml-1 font-mono text-[11px] opacity-80">（{tab.count}）</span>
        </Link>
      ))}
    </nav>
  );
}
