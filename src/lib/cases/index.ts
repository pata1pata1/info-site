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
      : { subjectLabel: c.category === "good-business" ? "団体名" : "事業者名", subjectName: c.businessName ?? undefined }),
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

/**
 * 検索対象のカラム（cases の文字列カラムのみ。PostgREST では配列・JSON の列に部分一致をかけられないため、
 * 事件内容・取り組み等の配列カラムと表彰（jsonb）は対象外）。
 */
const SEARCH_COLUMNS = [
  "title",
  "summary",
  "region",
  "current_status",
  "status_note",
  "person_name",
  "business_name",
  "business_type",
  "animal_type",
  "listing_reason",
] as const;
const SEARCH_LIMIT = 100;

/**
 * 公開中の事案を検索する（部分一致・英字の大文字小文字を区別しない・各語の AND）。
 * 絞り込みは DB 側（ilike）で行う。匿名クライアント＋RLS＋publish_status 条件で公開中の事案だけが対象。
 * terms は lib/search.ts の normalizeSearchQuery で正規化済みのものを渡す。
 */
export const searchCaseSummaries = cache(async (terms: string[]): Promise<CaseSummary[]> => {
  if (terms.length === 0) return [];
  const supabase = createPublicClient();
  if (!supabase) {
    const lower = terms.map((t) => t.toLowerCase());
    return seedCases
      .filter((c) => {
        const text = [c.title, c.summary, c.region, c.currentStatus, c.statusNote, c.animalType,
          c.category === "animal-abuse" ? c.personName : c.businessName].join(" ").toLowerCase();
        return lower.every((t) => text.includes(t));
      })
      .sort(byUpdatedDesc)
      .map(toSummary);
  }

  let query = supabase
    .from("cases")
    .select("category, slug, title, summary, region, animal_type, case_status, content_updated_on, person_name, business_name")
    .eq("publish_status", "published");
  // 語ごとに「いずれかのカラムに含む」条件を作り、語どうしは AND（.or() を重ねると AND になる）
  for (const term of terms) {
    const pattern = `"%${term}%"`;
    query = query.or(SEARCH_COLUMNS.map((column) => `${column}.ilike.${pattern}`).join(","));
  }
  const { data, error } = await query
    .order("content_updated_on", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(SEARCH_LIMIT);

  if (error) {
    console.error("[cases] search failed", error.message);
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
});

/** 公開中の案件1件（情報源・時系列・事実を含む）。見つからなければ null */
export const getCase = cache(async <C extends CategorySlug>(category: C, slug: string): Promise<CaseOf<C> | null> => {
  const supabase = createPublicClient();
  if (!supabase) {
    return (seedCases.find((c) => c.category === category && c.slug === slug) as CaseOf<C> | undefined) ?? null;
  }

  const load = (relations: string) =>
    supabase
      .from("cases")
      .select(`*, ${relations}`)
      .eq("category", category)
      .eq("slug", slug)
      .eq("publish_status", "published")
      .maybeSingle();

  const children = "case_sources(*), case_timeline_events(*), case_facts(*)";
  let { data, error } = await load(`${children}, case_images(*)`);
  if (error) {
    // case_images 作成前（マイグレーション 20261007000004 未実行）でもページを表示できるようにする
    console.warn("[cases] case_images を読み込めないため旧メイン画像で表示します（マイグレーション 20261007000004 未実行？）", error.message);
    ({ data, error } = await load(children));
  }
  if (error) {
    console.error("[cases] failed to load case", error.message);
    return null;
  }
  if (!data) return null;

  const publicUrl = (path: string) => supabase.storage.from(CASE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  return rowToCase(data as unknown as CaseRow, publicUrl) as CaseOf<C>;
});

/** 静的生成する個別ページの slug 一覧 */
export async function listCaseSlugs(category: CategorySlug): Promise<string[]> {
  return (await listCaseSummaries(category)).map((c) => c.key.split("/")[1]);
}
