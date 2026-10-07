import type { Metadata } from "next";
import Link from "next/link";
import { NewsEditor } from "@/components/admin/NewsEditor";
import { requireAdminPage } from "@/lib/admin/auth";
import { todayJst } from "@/lib/admin/case-form";

export const metadata: Metadata = { title: "お知らせの新規作成" };

export default async function AdminNewsNew() {
  await requireAdminPage("/admin/news/new");
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/news" className="text-xs text-slate-500 hover:text-cyan-200">← お知らせ</Link>
        <h1 className="mt-2 text-xl font-bold text-slate-50">お知らせの新規作成</h1>
      </div>
      <NewsEditor initial={{ title: "", body: "", label: "お知らせ", published_on: todayJst(), publish_status: "draft" }} />
    </div>
  );
}
