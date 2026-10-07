import type { Metadata } from "next";
import Link from "next/link";
import { primaryButtonClass } from "@/components/ui/form-styles";
import { requireAdminPage } from "@/lib/admin/auth";
import { publishBadge } from "@/lib/admin/labels";
import { publishStatusLabels, type PublishStatus } from "@/lib/cms/types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "お知らせ" };

export default async function AdminNewsList(props: PageProps<"/admin/news">) {
  const { supabase } = await requireAdminPage("/admin/news");
  const searchParams = await props.searchParams;
  const { data: rows } = await supabase
    .from("news")
    .select("id, title, label, published_on, publish_status")
    .order("published_on", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-50">お知らせ</h1>
        <Link href="/admin/news/new" className={primaryButtonClass}>＋ 新規作成</Link>
      </div>
      {searchParams.deleted === "1" && <p className="text-sm text-cyan-200">お知らせを削除しました。</p>}
      <ul className="panel divide-y divide-line overflow-hidden rounded-xl">
        {(rows ?? []).length === 0 && <li className="p-6 text-center text-sm text-slate-500">お知らせはありません。</li>}
        {(rows ?? []).map((row) => (
          <li key={row.id}>
            <Link href={`/admin/news/${row.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-cyan-400/[0.03]">
              <span className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${publishBadge[row.publish_status as PublishStatus]}`}>
                {publishStatusLabels[row.publish_status as PublishStatus]}
              </span>
              <span className="font-mono text-xs text-slate-500">{formatDate(row.published_on)}</span>
              <span className="text-xs text-slate-400">{row.label}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{row.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
