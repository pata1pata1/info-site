import type { MetadataRoute } from "next";
import { listCaseSummaries } from "@/lib/cases";
import { listCasesByPrefecture } from "@/lib/cases/by-prefecture";
import { OTHER_AREA, prefectures } from "@/lib/prefectures";
import { categories, siteUrl } from "@/lib/site";

// 事案の公開・非公開の変更はこの間隔で反映される（root layout と同じ）
export const revalidate = 300;

const absolute = (path: string) => new URL(path, siteUrl).href;

/**
 * 検索エンジン向けの sitemap.xml。
 * 事案は listCaseSummaries（publish_status = published かつ RLS）で取得した公開中のものだけを載せる。
 * 都道府県ページは掲載情報が1件以上ある地域だけを載せる（0件のページは中身がないため）。
 * 管理画面・ログイン・会員・検索など noindex のページは載せない。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cases, byPrefecture] = await Promise.all([listCaseSummaries(), listCasesByPrefecture()]);

  const areas = [...prefectures, OTHER_AREA].flatMap((area) => {
    const items = byPrefecture.get(area.slug);
    // items は最終更新日の新しい順なので先頭が最新
    return items ? [{ url: absolute(`/prefectures/${area.slug}`), lastModified: items[0].updatedAt }] : [];
  });

  return [
    { url: absolute("/") },
    ...categories.map((c) => ({ url: absolute(c.href) })),
    { url: absolute("/prefectures") },
    ...areas,
    ...cases.map((c) => ({ url: absolute(c.href), lastModified: c.updatedAt })),
  ];
}
