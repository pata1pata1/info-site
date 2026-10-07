import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { pageLabels } from "@/lib/admin/labels";
import type { PageSlug } from "@/lib/cms/types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "TOP・カテゴリ" };

export default async function AdminPagesList() {
  const { supabase } = await requireAdminPage("/admin/pages");
  const [{ data: published }, { data: drafts }] = await Promise.all([
    supabase.from("cms_pages").select("slug, content, updated_at"),
    supabase.from("cms_page_drafts").select("slug, content, updated_at"),
  ]);
  const pub = new Map((published ?? []).map((p) => [p.slug, p]));
  const draft = new Map((drafts ?? []).map((p) => [p.slug, p]));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-50">TOP・カテゴリ</h1>
      <ul className="panel divide-y divide-line overflow-hidden rounded-xl">
        {(Object.keys(pageLabels) as PageSlug[]).map((slug) => {
          const p = pub.get(slug);
          const d = draft.get(slug);
          const unpublished = d && JSON.stringify(d.content) !== JSON.stringify(p?.content);
          return (
            <li key={slug}>
              <Link href={`/admin/pages/${slug}`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-cyan-400/[0.03]">
                <span className="text-sm font-medium text-slate-100">{pageLabels[slug]}</span>
                {unpublished && (
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200 ring-1 ring-inset ring-amber-300/30">
                    未公開の下書きあり
                  </span>
                )}
                <span className="ml-auto font-mono text-xs text-slate-500">
                  {p ? `公開 ${formatDate(p.updated_at.slice(0, 10))}` : "未公開"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
