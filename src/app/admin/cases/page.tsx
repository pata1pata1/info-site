import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/info/StatusBadge";
import { primaryButtonClass } from "@/components/ui/form-styles";
import { requireAdminPage } from "@/lib/admin/auth";
import { publishBadge } from "@/lib/admin/labels";
import type { CaseStatus } from "@/lib/cases";
import { getSiteContent } from "@/lib/cms/content";
import { publishStatusLabels, type PublishStatus } from "@/lib/cms/types";
import { formatDate } from "@/lib/format";
import { categories, type CategorySlug } from "@/lib/site";

export const metadata: Metadata = { title: "案件" };

export default async function AdminCasesList(props: PageProps<"/admin/cases">) {
  const { supabase } = await requireAdminPage("/admin/cases");
  const searchParams = await props.searchParams;
  const category = categories.find((c) => c.slug === searchParams.category)?.slug;

  let query = supabase
    .from("cases")
    .select("id, category, slug, title, case_status, publish_status, content_updated_on")
    .order("updated_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const [{ data: rows, error }, content] = await Promise.all([query, getSiteContent()]);

  const tabs: { href: string; label: string; active: boolean }[] = [
    { href: "/admin/cases", label: "すべて", active: !category },
    ...categories.map((c) => ({ href: `/admin/cases?category=${c.slug}`, label: content.categories[c.slug].title, active: category === c.slug })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-50">案件</h1>
        <Link href={`/admin/cases/new${category ? `?category=${category}` : ""}`} className={primaryButtonClass}>
          ＋ 新規作成
        </Link>
      </div>
      {searchParams.deleted === "1" && <p className="text-sm text-cyan-200">案件を削除しました。</p>}

      <nav className="flex flex-wrap gap-1 text-xs" aria-label="カテゴリで絞り込み">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-3 py-1.5 ${tab.active ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-300/25" : "text-slate-400 hover:text-slate-200"}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {error && <p className="text-sm text-rose-300">読み込みに失敗しました：{error.message}</p>}
      <ul className="panel divide-y divide-line overflow-hidden rounded-xl">
        {(rows ?? []).length === 0 && <li className="p-6 text-center text-sm text-slate-500">案件はありません。</li>}
        {(rows ?? []).map((row) => (
          <li key={row.id}>
            <Link href={`/admin/cases/${row.id}`} className="flex flex-col gap-2 px-5 py-4 hover:bg-cyan-400/[0.03] sm:flex-row sm:items-center sm:gap-4">
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${publishBadge[row.publish_status as PublishStatus]}`}>
                  {publishStatusLabels[row.publish_status as PublishStatus]}
                </span>
                <StatusBadge status={row.case_status as CaseStatus} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{row.title}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                  {content.categories[row.category as CategorySlug].title} ・ /{row.category}/{row.slug}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-slate-500">更新 {formatDate(row.content_updated_on)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
