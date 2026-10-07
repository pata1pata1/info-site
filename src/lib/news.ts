/** サイトからのお知らせ・更新情報 */
export type NewsItem = {
  id: string;
  date: string;
  label: "お知らせ" | "更新" | "メンテナンス";
  title: string;
};

export const newsItems: NewsItem[] = [
  { id: "n-005", date: "2026-10-07", label: "更新", title: "報道・公的機関の発表に基づく個別情報ページを公開しました" },
  { id: "n-004", date: "2026-10-06", label: "お知らせ", title: "サイトを公開しました（テスト版）" },
  { id: "n-003", date: "2026-10-01", label: "更新", title: "掲載基準・ご利用にあたっての注意事項を準備中です" },
  { id: "n-002", date: "2026-09-20", label: "更新", title: "カテゴリ「優良動物関連事業者」を追加しました" },
  { id: "n-001", date: "2026-09-10", label: "メンテナンス", title: "【サンプル】メンテナンスのお知らせ" },
];
