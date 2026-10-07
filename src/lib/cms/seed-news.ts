import type { NewsItem } from "./types";

/**
 * お知らせの初期データ。
 * Supabase 未接続時の表示と、DB 初期データの元データとして使う（接続後は /admin/news で管理）。
 */
export const seedNews: NewsItem[] = [
  { id: "n-005", date: "2026-10-07", label: "更新", title: "報道・公的機関の発表に基づく個別情報ページを公開しました", body: "" },
  { id: "n-004", date: "2026-10-06", label: "お知らせ", title: "サイトを公開しました（テスト版）", body: "" },
  { id: "n-003", date: "2026-10-01", label: "更新", title: "掲載基準・ご利用にあたっての注意事項を準備中です", body: "" },
  { id: "n-002", date: "2026-09-20", label: "更新", title: "カテゴリ「優良動物関連事業者」を追加しました", body: "" },
  { id: "n-001", date: "2026-09-10", label: "メンテナンス", title: "【サンプル】メンテナンスのお知らせ", body: "" },
];
