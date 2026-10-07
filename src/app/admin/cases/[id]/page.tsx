import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseEditor } from "@/components/admin/CaseEditor";
import { CaseImagesPanel, type AdminCaseImage } from "@/components/admin/CaseImagesPanel";
import { DeleteCaseButton } from "@/components/admin/DeleteButtons";
import { requireAdminPage } from "@/lib/admin/auth";
import { rowToForm } from "@/lib/admin/case-form";
import type { CaseRow } from "@/lib/cases/mapper";
import { getSiteContent } from "@/lib/cms/content";
import { publishStatusLabels } from "@/lib/cms/types";
import { CASE_IMAGE_BUCKET } from "@/lib/media/config";
import { categories, type CategorySlug } from "@/lib/site";

export const metadata: Metadata = { title: "事案の編集" };

const UUID = /^[0-9a-f-]{36}$/;

export default async function AdminCaseEdit(props: PageProps<"/admin/cases/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireAdminPage(`/admin/cases/${id}`);
  if (!UUID.test(id)) notFound();
  const searchParams = await props.searchParams;

  const [{ data }, images, content] = await Promise.all([
    supabase.from("cases").select("*, case_sources(*), case_timeline_events(*), case_facts(*)").eq("id", id).maybeSingle(),
    supabase.from("case_images").select("id, storage_path, alt, caption, source_name, source_url").eq("case_id", id).order("sort_order"),
    getSiteContent(),
  ]);
  if (!data) notFound();
  const row = data as CaseRow;
  const labels = Object.fromEntries(categories.map((c) => [c.slug, content.categories[c.slug].title])) as Record<CategorySlug, string>;
  const caseImages: AdminCaseImage[] = (images.data ?? []).map((img) => ({
    id: img.id,
    url: supabase.storage.from(CASE_IMAGE_BUCKET).getPublicUrl(img.storage_path).data.publicUrl,
    alt: img.alt ?? "",
    caption: img.caption ?? "",
    source_name: img.source_name ?? "",
    source_url: img.source_url ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/cases" className="text-xs text-slate-500 hover:text-cyan-200">← 事案ページ</Link>
        <h1 className="mt-2 text-xl font-bold text-slate-50">{row.title}</h1>
        <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
          <span>公開状態：{publishStatusLabels[row.publish_status]}</span>
          {row.publish_status === "published" && (
            <a href={`/${row.category}/${row.slug}`} target="_blank" className="text-cyan-300 hover:text-cyan-200">
              公開ページを見る ↗
            </a>
          )}
        </p>
      </div>
      {searchParams.created === "1" && (
        <p className="rounded-lg bg-cyan-400/[0.06] px-4 py-3 text-sm text-cyan-100 ring-1 ring-inset ring-cyan-300/25">
          事案を作成しました。続けて事案画像を登録できます。
        </p>
      )}

      <CaseEditor
        initial={rowToForm(row)}
        categoryLabels={labels}
        imagesSlot={
          <CaseImagesPanel caseId={row.id} images={caseImages} loadError={images.error?.message} />
        }
      />

      <section className="panel flex flex-wrap items-center justify-between gap-3 rounded-xl border-rose-400/20 p-5">
        <div>
          <h2 className="text-sm font-bold text-rose-200">事案の削除</h2>
          <p className="mt-1 text-xs text-slate-500">
            本文・情報源・時系列・事案画像を完全に削除します。一時的に隠す場合は公開状態を「非公開」にしてください。
          </p>
        </div>
        <DeleteCaseButton id={row.id} />
      </section>
    </div>
  );
}
