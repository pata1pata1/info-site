import { cache } from "react";
import { toPlainText } from "../richtext";
import { getCategory, type CategorySlug } from "../site";
import { createPublicClient } from "../supabase/public";
import { CASE_IMAGE_BUCKET, rowToCase, type CaseRow } from "./mapper";
import { animalAbuseCases } from "./seed/animal-abuse";
import { badBusinessCases } from "./seed/bad-business";
import { goodBusinessCases } from "./seed/good-business";
import type { Case, CaseOf, CaseStatus } from "./types";

export type * from "./types";
export { statusOptions } from "./types";

/**
 * 案件データの取得。
 * Supabase 接続時は DB（公開中の案件のみ。RLS で制限）から、未接続時は seed/ の初期データから読む。
 */

/** 一覧カードに表示するための共通形式 */
export type CaseSummary = {
  key: string;
  href: string;
  category: CategorySlug;
  title: string;
  summary: string;
  region: string;
  subjectLabel: string;
  subjectName?: string;
  animalType: string;
  status: CaseStatus;
  updatedAt: string;
};

const seedCases: Case[] = [...animalAbuseCases, ...badBusinessCases, ...goodBusinessCases];

const byUpdatedDesc = (a: { updatedAt: string }, b: { updatedAt: string }) => b.updatedAt.localeCompare(a.updatedAt);

function summarize(c: {
  category: CategorySlug;
  slug: string;
  title: string;
  summary: string;
  region: string;
  animalType: string;
  status: CaseStatus;
  updatedAt: string;
  personName?: string | null;
  businessName?: string | null;
}): CaseSummary {
  return {
    key: `${c.category}/${c.slug}`,
    href: `${getCategory(c.category).href}/${c.slug}`,
    category: c.category,
    title: c.title,
    summary: toPlainText(c.summary),
    region: c.region,
    animalType: c.animalType,
    status: c.status,
    updatedAt: c.updatedAt,
    ...(c.category === "animal-abuse"
      ? { subjectLabel: "人物名", subjectName: c.personName ?? "非公表" }
      : { subjectLabel: "事業者名", subjectName: c.businessName ?? undefined }),
  };
}

export function toSummary(c: Case): CaseSummary {
  return summarize({
    ...c,
    personName: c.category === "animal-abuse" ? c.personName : undefined,
    businessName: c.category === "animal-abuse" ? undefined : c.businessName,
  });
}

/** 公開中の案件の一覧（最終更新日の新しい順） */
export const listCaseSummaries = cache(
  async (category?: CategorySlug, limit?: number): Promise<CaseSummary[]> => {
    const supabase = createPublicClient();
    if (!supabase) {
      return seedCases
        .filter((c) => !category || c.category === category)
        .sort(byUpdatedDesc)
        .slice(0, limit)
        .map(toSummary);
    }

    let query = supabase
      .from("cases")
      .select("category, slug, title, summary, region, animal_type, case_status, content_updated_on, person_name, business_name")
      .eq("publish_status", "published")
      .order("content_updated_on", { ascending: false })
      .order("updated_at", { ascending: false });
    if (category) query = query.eq("category", category);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("[cases] failed to load list", error.message);
      return [];
    }
    return (data ?? []).map((row) =>
      summarize({
        category: row.category,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        region: row.region,
        animalType: row.animal_type,
        status: row.case_status,
        updatedAt: row.content_updated_on,
        personName: row.person_name,
        businessName: row.business_name,
      }),
    );
  },
);

/** 公開中の案件1件（情報源・時系列・事実を含む）。見つからなければ null */
export const getCase = cache(async <C extends CategorySlug>(category: C, slug: string): Promise<CaseOf<C> | null> => {
  const supabase = createPublicClient();
  if (!supabase) {
    return (seedCases.find((c) => c.category === category && c.slug === slug) as CaseOf<C> | undefined) ?? null;
  }

  const { data, error } = await supabase
    .from("cases")
    .select("*, case_sources(*), case_timeline_events(*), case_facts(*)")
    .eq("category", category)
    .eq("slug", slug)
    .eq("publish_status", "published")
    .maybeSingle();
  if (error) {
    console.error("[cases] failed to load case", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as CaseRow;
  const imageUrl = row.main_image_path
    ? supabase.storage.from(CASE_IMAGE_BUCKET).getPublicUrl(row.main_image_path).data.publicUrl
    : null;
  return rowToCase(row, imageUrl) as CaseOf<C>;
});

/** 静的生成する個別ページの slug 一覧 */
export async function listCaseSlugs(category: CategorySlug): Promise<string[]> {
  return (await listCaseSummaries(category)).map((c) => c.key.split("/")[1]);
}
