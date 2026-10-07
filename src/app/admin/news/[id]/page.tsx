import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteNewsButton } from "@/components/admin/DeleteButtons";
import { NewsEditor } from "@/components/admin/NewsEditor";
import { requireAdminPage } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "お知らせの編集" };

export default async function AdminNewsEdit(props: PageProps<"/admin/news/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireAdminPage(`/admin/news/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const searchParams = await props.searchParams;

  const { data: row } = await supabase
    .from("news")
    .select("id, title, body, label, published_on, publish_status")
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/news" className="text-xs text-slate-500 hover:text-cyan-200">← お知らせ</Link>
        <h1 className="mt-2 text-xl font-bold text-slate-50">お知らせの編集</h1>
      </div>
      {searchParams.created === "1" && <p className="text-sm text-cyan-200">お知らせを作成しました。</p>}
      <NewsEditor initial={row} />
      <div className="flex justify-end">
        <DeleteNewsButton id={row.id} />
      </div>
    </div>
  );
}
