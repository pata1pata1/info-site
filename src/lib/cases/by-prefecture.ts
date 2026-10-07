import { cache } from "react";
import { detectPrefecture, OTHER_AREA } from "../prefectures";
import { listCaseSummaries, type CaseSummary } from ".";

/**
 * 公開中の案件を都道府県ごとに振り分ける（キーは都道府県の slug。分類できないものは "other"）。
 * 3カテゴリすべてを含み、並びは listCaseSummaries と同じ（最終更新日の新しい順）。
 */
export const listCasesByPrefecture = cache(async (): Promise<Map<string, CaseSummary[]>> => {
  const groups = new Map<string, CaseSummary[]>();
  for (const item of await listCaseSummaries()) {
    const key = detectPrefecture(item.region)?.slug ?? OTHER_AREA.slug;
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return groups;
});
