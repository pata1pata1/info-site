import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaseDetail } from "@/components/case/CaseDetail";
import { CommentSection } from "@/components/comments/CommentSection";
import { getCase, getCasesByCategory } from "@/lib/cases";

export function generateStaticParams() {
  return getCasesByCategory("good-business").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/good-business/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const item = getCase("good-business", slug);
  if (!item) return {};
  return { title: item.title, description: item.summary };
}

export default async function Page(props: PageProps<"/good-business/[slug]">) {
  const { slug } = await props.params;
  const item = getCase("good-business", slug);
  if (!item) notFound();

  return (
    <CaseDetail item={item}>
      <Suspense fallback={<p className="text-sm text-slate-500">情報提供コメントを読み込んでいます…</p>}>
        <CommentSection category={item.category} slug={item.slug} />
      </Suspense>
    </CaseDetail>
  );
}
