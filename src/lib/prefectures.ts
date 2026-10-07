/**
 * 都道府県から探す（/prefectures）で使う都道府県の定義と、案件の「地域」からの判定。
 * cases.region は自由記述（例：「埼玉県川口市」「北海道（札幌地裁浦河支部管内…）」）のため、
 * DB の値は変更せず、表示時にここで都道府県を判定する。
 */

export type Prefecture = {
  /** URL に使う識別子（/prefectures/{slug}） */
  slug: string;
  /** 正式名称（例：「埼玉県」「東京都」） */
  name: string;
};

export type PrefectureArea = {
  name: string;
  prefectures: Prefecture[];
};

export const prefectureAreas: PrefectureArea[] = [
  {
    name: "北海道・東北",
    prefectures: [
      { slug: "hokkaido", name: "北海道" },
      { slug: "aomori", name: "青森県" },
      { slug: "iwate", name: "岩手県" },
      { slug: "miyagi", name: "宮城県" },
      { slug: "akita", name: "秋田県" },
      { slug: "yamagata", name: "山形県" },
      { slug: "fukushima", name: "福島県" },
    ],
  },
  {
    name: "関東",
    prefectures: [
      { slug: "ibaraki", name: "茨城県" },
      { slug: "tochigi", name: "栃木県" },
      { slug: "gunma", name: "群馬県" },
      { slug: "saitama", name: "埼玉県" },
      { slug: "chiba", name: "千葉県" },
      { slug: "tokyo", name: "東京都" },
      { slug: "kanagawa", name: "神奈川県" },
    ],
  },
  {
    name: "中部",
    prefectures: [
      { slug: "niigata", name: "新潟県" },
      { slug: "toyama", name: "富山県" },
      { slug: "ishikawa", name: "石川県" },
      { slug: "fukui", name: "福井県" },
      { slug: "yamanashi", name: "山梨県" },
      { slug: "nagano", name: "長野県" },
      { slug: "gifu", name: "岐阜県" },
      { slug: "shizuoka", name: "静岡県" },
      { slug: "aichi", name: "愛知県" },
    ],
  },
  {
    name: "近畿",
    prefectures: [
      { slug: "mie", name: "三重県" },
      { slug: "shiga", name: "滋賀県" },
      { slug: "kyoto", name: "京都府" },
      { slug: "osaka", name: "大阪府" },
      { slug: "hyogo", name: "兵庫県" },
      { slug: "nara", name: "奈良県" },
      { slug: "wakayama", name: "和歌山県" },
    ],
  },
  {
    name: "中国",
    prefectures: [
      { slug: "tottori", name: "鳥取県" },
      { slug: "shimane", name: "島根県" },
      { slug: "okayama", name: "岡山県" },
      { slug: "hiroshima", name: "広島県" },
      { slug: "yamaguchi", name: "山口県" },
    ],
  },
  {
    name: "四国",
    prefectures: [
      { slug: "tokushima", name: "徳島県" },
      { slug: "kagawa", name: "香川県" },
      { slug: "ehime", name: "愛媛県" },
      { slug: "kochi", name: "高知県" },
    ],
  },
  {
    name: "九州・沖縄",
    prefectures: [
      { slug: "fukuoka", name: "福岡県" },
      { slug: "saga", name: "佐賀県" },
      { slug: "nagasaki", name: "長崎県" },
      { slug: "kumamoto", name: "熊本県" },
      { slug: "oita", name: "大分県" },
      { slug: "miyazaki", name: "宮崎県" },
      { slug: "kagoshima", name: "鹿児島県" },
      { slug: "okinawa", name: "沖縄県" },
    ],
  },
];

export const prefectures: Prefecture[] = prefectureAreas.flatMap((area) => area.prefectures);

/** 都道府県に分類できない案件（「九州・沖縄」「全国」など）の一覧ページ */
export const OTHER_AREA = { slug: "other", name: "その他・広域" } as const;

export function getPrefecture(slug: string): Prefecture | undefined {
  return prefectures.find((p) => p.slug === slug);
}

/**
 * 都道府県名を省いて書かれやすい政令指定都市。「横浜市中区」のような地域もその県として扱う。
 * （都道府県名から始まる地域はこの表を使わずに判定できる）
 */
const designatedCities: Record<string, string> = {
  札幌市: "北海道",
  仙台市: "宮城県",
  さいたま市: "埼玉県",
  千葉市: "千葉県",
  横浜市: "神奈川県",
  川崎市: "神奈川県",
  相模原市: "神奈川県",
  新潟市: "新潟県",
  静岡市: "静岡県",
  浜松市: "静岡県",
  名古屋市: "愛知県",
  京都市: "京都府",
  大阪市: "大阪府",
  堺市: "大阪府",
  神戸市: "兵庫県",
  岡山市: "岡山県",
  広島市: "広島県",
  北九州市: "福岡県",
  福岡市: "福岡県",
  熊本市: "熊本県",
};

/**
 * 案件の「地域」から都道府県を判定する。判定できない・複数の都道府県にまたがる場合は undefined（その他・広域）。
 *
 * - 先頭が都道府県名（「埼玉県川口市」「北海道岩内町」など）ならその都道府県
 * - 先頭が政令指定都市名（「横浜市中区」など）ならその市がある都道府県
 * - 別の都道府県名も含む（「東京都・神奈川県」など）場合は広域として扱う
 * - 「九州・沖縄」「全国」「地域不明」のように先頭が都道府県名でないものは分類しない
 */
export function detectPrefecture(region: string): Prefecture | undefined {
  const text = region.normalize("NFKC").trim();
  if (!text) return undefined;

  const leadingName =
    prefectures.find((p) => text.startsWith(p.name))?.name ??
    Object.entries(designatedCities).find(([city]) => text.startsWith(city))?.[1];
  if (!leadingName) return undefined;

  const mentionsOther = prefectures.some((p) => p.name !== leadingName && text.includes(p.name));
  if (mentionsOther) return undefined;

  return prefectures.find((p) => p.name === leadingName);
}
