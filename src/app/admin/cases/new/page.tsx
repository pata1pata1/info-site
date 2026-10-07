import type { Metadata } from "next";
import Link from "next/link";
import { CaseEditor } from "@/components/admin/CaseEditor";
import { requireAdminPage } from "@/lib/admin/auth";
import { emptyCase } from "@/lib/admin/case-form";
import { getSiteContent } from "@/lib/cms/content";
import { categories, type CategorySlug } from "@/lib/site";

export const metadata: Metadata = { title: "事案の新規作成" };

export default async function AdminCaseNew(props: PageProps<"/admin/cases/new">) {
  await requireAdminPage("/admin/cases/new");
  const searchParams = await props.searchParams;
  const category = categories.find((c) => c.slug === searchParams.category)?.slug ?? "animal-abuse";
  const content = await getSiteContent();
  const labels = Object.fromEntries(categories.map((c) => [c.slug, content.categories[c.slug].title])) as Record<CategorySlug, string>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cases" className="text-xs text-slate-500 hover:text-cyan-200">← 事案ページ</Link>
        <h1 className="mt-2 text-xl font-bold text-slate-50">事案の新規作成</h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          報道機関・公的機関で確認できる情報だけを登録してください。最初は「下書き」で保存し、内容と情報源を確認してから公開することをおすすめします。事案画像は作成後に登録できます。
        </p>
      </div>
      <CaseEditor initial={emptyCase(category)} categoryLabels={labels} />
    </div>
  );
}
