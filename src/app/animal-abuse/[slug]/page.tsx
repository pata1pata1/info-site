import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaseDetail } from "@/components/case/CaseDetail";
import { CommentSection } from "@/components/comments/CommentSection";
import { getCase, listCaseSlugs } from "@/lib/cases";
import { toPlainText } from "@/lib/richtext";

export async function generateStaticParams() {
  return (await listCaseSlugs("animal-abuse")).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/animal-abuse/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await getCase("animal-abuse", slug);
  if (!item) return {};
  return { title: item.title, description: toPlainText(item.summary) };
}

export default async function Page(props: PageProps<"/animal-abuse/[slug]">) {
  const { slug } = await props.params;
  const item = await getCase("animal-abuse", slug);
  if (!item) notFound();

  return (
    <CaseDetail item={item}>
      <Suspense fallback={<p className="text-sm text-slate-500">情報提供コメントを読み込んでいます…</p>}>
        <CommentSection category={item.category} slug={item.slug} />
      </Suspense>
    </CaseDetail>
  );
}
