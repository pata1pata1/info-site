import type { CategorySlug } from "./site";

/**
 * 情報1件分のデータ構造。
 * 将来の絞り込み（地域・事業者名・人物名・動物種別・投稿日・ステータス）を想定したフィールドを持つ。
 * 現段階ではすべて架空のダミーデータ。
 */
export type InfoStatus = "確認中" | "情報提供あり" | "報道あり" | "確認済み";

export type InfoItem = {
  id: string;
  category: CategorySlug;
  title: string;
  summary: string;
  region: string;
  businessName?: string;
  personName?: string;
  animalType: string;
  postedAt: string; // YYYY-MM-DD
  status: InfoStatus;
};

export const infoItems: InfoItem[] = [
  // 動物虐待者情報
  {
    id: "aa-001",
    category: "animal-abuse",
    title: "【サンプル】多頭飼育崩壊に関する報道",
    summary:
      "ダミーテキストです。ここに事案の概要が入ります。報道や公的機関の発表をもとに要点をまとめて掲載する想定です。",
    region: "関東",
    personName: "A氏（仮名）",
    animalType: "猫",
    postedAt: "2026-10-04",
    status: "報道あり",
  },
  {
    id: "aa-002",
    category: "animal-abuse",
    title: "【サンプル】飼育放棄が疑われる事案",
    summary:
      "ダミーテキストです。ここに事案の概要が入ります。現在、情報の確認を進めている段階の掲載例です。",
    region: "近畿",
    personName: "B氏（仮名）",
    animalType: "犬",
    postedAt: "2026-09-28",
    status: "確認中",
  },
  {
    id: "aa-003",
    category: "animal-abuse",
    title: "【サンプル】動物愛護管理法違反での書類送検",
    summary:
      "ダミーテキストです。ここに事案の概要が入ります。公的な発表に基づく情報の掲載例です。",
    region: "九州・沖縄",
    personName: "C氏（仮名）",
    animalType: "犬",
    postedAt: "2026-09-15",
    status: "確認済み",
  },
  {
    id: "aa-004",
    category: "animal-abuse",
    title: "【サンプル】野生動物への加害に関する情報",
    summary:
      "ダミーテキストです。ここに事案の概要が入ります。寄せられた情報をもとにした掲載例です。",
    region: "東北",
    personName: "D氏（仮名）",
    animalType: "鳥類",
    postedAt: "2026-09-02",
    status: "情報提供あり",
  },

  // 悪徳動物関連事業者
  {
    id: "bb-001",
    category: "bad-business",
    title: "【サンプル】飼養環境の不備が指摘されたブリーダー",
    summary:
      "ダミーテキストです。ここに指摘内容の概要が入ります。行政指導や報道の有無などを整理して掲載する想定です。",
    region: "中部",
    businessName: "サンプルブリーダーA",
    animalType: "犬",
    postedAt: "2026-10-05",
    status: "報道あり",
  },
  {
    id: "bb-002",
    category: "bad-business",
    title: "【サンプル】販売時の説明不足に関する情報",
    summary:
      "ダミーテキストです。ここに指摘内容の概要が入ります。購入者からの情報をもとにした掲載例です。",
    region: "関東",
    businessName: "サンプルペットショップB",
    animalType: "猫",
    postedAt: "2026-09-30",
    status: "情報提供あり",
  },
  {
    id: "bb-003",
    category: "bad-business",
    title: "【サンプル】第一種動物取扱業の登録取消",
    summary:
      "ダミーテキストです。ここに指摘内容の概要が入ります。自治体の公表情報に基づく掲載例です。",
    region: "中国・四国",
    businessName: "サンプル事業者C",
    animalType: "犬・猫",
    postedAt: "2026-09-20",
    status: "確認済み",
  },
  {
    id: "bb-004",
    category: "bad-business",
    title: "【サンプル】過剰繁殖が疑われる事業者",
    summary:
      "ダミーテキストです。ここに指摘内容の概要が入ります。現在確認中の情報の掲載例です。",
    region: "北海道",
    businessName: "サンプル繁殖場D",
    animalType: "小動物",
    postedAt: "2026-09-08",
    status: "確認中",
  },

  // 優良動物関連事業者
  {
    id: "gb-001",
    category: "good-business",
    title: "【サンプル】譲渡後のサポートが手厚い保護団体",
    summary:
      "ダミーテキストです。ここに評価ポイントの概要が入ります。飼養環境や対応の丁寧さなどを紹介する想定です。",
    region: "関東",
    businessName: "サンプル保護団体A",
    animalType: "犬・猫",
    postedAt: "2026-10-03",
    status: "確認済み",
  },
  {
    id: "gb-002",
    category: "good-business",
    title: "【サンプル】見学対応・飼養環境の公開に積極的なブリーダー",
    summary:
      "ダミーテキストです。ここに評価ポイントの概要が入ります。利用者からの情報をもとにした掲載例です。",
    region: "近畿",
    businessName: "サンプルブリーダーB",
    animalType: "猫",
    postedAt: "2026-09-25",
    status: "情報提供あり",
  },
  {
    id: "gb-003",
    category: "good-business",
    title: "【サンプル】終生飼養に配慮したペットホテル",
    summary:
      "ダミーテキストです。ここに評価ポイントの概要が入ります。高齢動物への対応などを紹介する想定です。",
    region: "中部",
    businessName: "サンプルペットホテルC",
    animalType: "犬",
    postedAt: "2026-09-12",
    status: "確認中",
  },
  {
    id: "gb-004",
    category: "good-business",
    title: "【サンプル】地域猫活動に協力する動物病院",
    summary:
      "ダミーテキストです。ここに評価ポイントの概要が入ります。地域活動への協力実績などを紹介する想定です。",
    region: "九州・沖縄",
    businessName: "サンプル動物病院D",
    animalType: "猫",
    postedAt: "2026-09-01",
    status: "確認済み",
  },
];

export function getItemsByCategory(category: CategorySlug): InfoItem[] {
  return infoItems
    .filter((item) => item.category === category)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export function getRecentItems(limit: number): InfoItem[] {
  return [...infoItems]
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .slice(0, limit);
}

export type NewsItem = {
  id: string;
  date: string;
  label: "お知らせ" | "更新" | "メンテナンス";
  title: string;
};

export const newsItems: NewsItem[] = [
  { id: "n-004", date: "2026-10-06", label: "お知らせ", title: "サイトを公開しました（テスト版）" },
  { id: "n-003", date: "2026-10-01", label: "更新", title: "掲載基準・ご利用にあたっての注意事項を準備中です" },
  { id: "n-002", date: "2026-09-20", label: "更新", title: "カテゴリ「優良動物関連事業者」を追加しました" },
  { id: "n-001", date: "2026-09-10", label: "メンテナンス", title: "【サンプル】メンテナンスのお知らせ" },
];

export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}
