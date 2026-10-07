import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageEditor, type PageField } from "@/components/admin/PageEditor";
import { requireAdminPage } from "@/lib/admin/auth";
import { pageLabels } from "@/lib/admin/labels";
import { defaultCategoryContent, defaultHomeContent } from "@/lib/cms/defaults";
import type { PageSlug } from "@/lib/cms/types";

export const metadata: Metadata = { title: "TOP・カテゴリの編集" };

const homeFields: PageField[] = [
  { group: "サイト共通", name: "siteName", label: "サイト名", kind: "text", required: true, hint: "ヘッダー・フッター・ブラウザのタブに表示されます。" },
  { group: "サイト共通", name: "tagline", label: "キャッチフレーズ", kind: "text", required: true },
  { group: "サイト共通", name: "description", label: "サイト説明文", kind: "rich", hint: "TOPページ上部とフッターに表示されます。" },
  { group: "サイト共通", name: "footerNote", label: "フッターの注記", kind: "rich" },
  { group: "TOPページのセクション", name: "categoriesTitle", label: "「カテゴリ」見出し", kind: "text", required: true },
  { group: "TOPページのセクション", name: "categoriesDescription", label: "「カテゴリ」説明文", kind: "rich" },
  { group: "TOPページのセクション", name: "recentTitle", label: "「最近追加された情報」見出し", kind: "text", required: true },
  { group: "TOPページのセクション", name: "recentDescription", label: "「最近追加された情報」説明文", kind: "rich" },
  { group: "TOPページのセクション", name: "newsTitle", label: "「お知らせ」見出し", kind: "text", required: true },
  { group: "TOPページのセクション", name: "newsDescription", label: "「お知らせ」説明文", kind: "rich" },
];

const categoryFields: PageField[] = [
  { group: "カテゴリページ", name: "title", label: "ページタイトル", kind: "text", required: true, hint: "メニュー・パンくずにも使われます。" },
  { group: "カテゴリページ", name: "description", label: "説明文", kind: "rich" },
  { group: "カテゴリページ", name: "supplement", label: "補足文", kind: "rich", hint: "説明文の下に小さく表示されます（任意）。" },
  {
    group: "カテゴリページ",
    name: "policy",
    label: "掲載方針（NOTICE）",
    kind: "rich",
    hint: "一覧ページと、このカテゴリの個別ページ最下部に表示されます。",
  },
];

export default async function AdminPageEdit(props: PageProps<"/admin/pages/[slug]">) {
  const { slug } = await props.params;
  const { supabase } = await requireAdminPage(`/admin/pages/${slug}`);
  if (!(slug in pageLabels)) notFound();
  const pageSlug = slug as PageSlug;

  const [{ data: draft }, { data: published }] = await Promise.all([
    supabase.from("cms_page_drafts").select("content").eq("slug", pageSlug).maybeSingle(),
    supabase.from("cms_pages").select("content").eq("slug", pageSlug).maybeSingle(),
  ]);
  const defaults: Record<string, string> =
    pageSlug === "home" ? defaultHomeContent : defaultCategoryContent[pageSlug];
  const initial = { ...defaults, ...(published?.content ?? {}), ...(draft?.content ?? {}) } as Record<string, string>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pages" className="text-xs text-slate-500 hover:text-cyan-200">← TOP・カテゴリ</Link>
        <h1 className="mt-2 text-xl font-bold text-slate-50">{pageLabels[pageSlug]}</h1>
        <p className="mt-1 text-xs text-slate-500">「下書き保存」はサイトに反映されません。「公開する」で公開中の内容が置き換わります。</p>
      </div>
      <PageEditor
        slug={pageSlug}
        fields={pageSlug === "home" ? homeFields : categoryFields}
        initial={initial}
        publicPath={pageSlug === "home" ? "/" : `/${pageSlug}`}
      />
    </div>
  );
}
