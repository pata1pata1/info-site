import { cache } from "react";
import { categories, type CategorySlug } from "../site";
import { createPublicClient } from "../supabase/public";
import { defaultCategoryContent, defaultHomeContent, defaultSiteContent } from "./defaults";
import { seedNews } from "./seed-news";
import type { CategoryContent, HomeContent, NewsItem, SiteContent } from "./types";

/**
 * 公開中のページ文章（TOP・カテゴリ）。
 * DB 未接続・未登録の項目は初期値で補う（項目を後から増やしても表示が欠けないようにする）。
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const supabase = createPublicClient();
  if (!supabase) return defaultSiteContent;

  const { data, error } = await supabase.from("cms_pages").select("slug, content");
  if (error) {
    console.error("[cms] failed to load pages", error.message);
    return defaultSiteContent;
  }

  const bySlug = new Map((data ?? []).map((row) => [row.slug as string, row.content as Record<string, unknown>]));
  return {
    home: { ...defaultHomeContent, ...(bySlug.get("home") as Partial<HomeContent> | undefined) },
    categories: Object.fromEntries(
      categories.map((c) => [
        c.slug,
        { ...defaultCategoryContent[c.slug], ...(bySlug.get(c.slug) as Partial<CategoryContent> | undefined) },
      ]),
    ) as Record<CategorySlug, CategoryContent>,
  };
});

/** 公開中のお知らせ（新しい順） */
export const getPublishedNews = cache(async (limit = 10): Promise<NewsItem[]> => {
  const supabase = createPublicClient();
  if (!supabase) return seedNews.slice(0, limit);

  const { data, error } = await supabase
    .from("news")
    .select("id, title, body, label, published_on")
    .eq("publish_status", "published")
    .order("published_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[cms] failed to load news", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.published_on,
    label: row.label,
    title: row.title,
    body: row.body,
  }));
});
