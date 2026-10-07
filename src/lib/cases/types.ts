import type { CategorySlug } from "../site";

/**
 * 個別情報ページのデータ構造。
 *
 * 掲載ルール：
 * - 報道機関・公的機関で確認できた事実だけを記載する（SNS 投稿のみを根拠にしない）
 * - 情報源に書かれていない内容を推測・補完しない
 * - 逮捕・起訴は有罪を意味しない。ステータスは手続きの段階をそのまま記載する
 * - 住所は市区町村程度まで。電話番号・家族情報などは記載しない
 */

/** 情報源。ページ下部の「情報源・参考資料」に表示する */
export type Source = {
  id: string;
  /** 媒体名・機関名 */
  publisher: string;
  /** 記事・資料のタイトル */
  title: string;
  /** 公開日（YYYY-MM-DD） */
  publishedAt: string;
  url: string;
  kind: "報道" | "公的機関";
};

/** 時系列の1項目。日付は判明している粒度で記載する（YYYY / YYYY-MM / YYYY-MM-DD） */
export type TimelineEvent = {
  date: string;
  /** 日付が期間・概数の場合の補足（例：「〜2017-04」「上旬」） */
  dateNote?: string;
  title: string;
  description?: string;
  /** 根拠となる Source.id */
  sourceIds: string[];
};

/** 「確認されている事実」の1項目 */
export type Fact = {
  text: string;
  sourceIds: string[];
};

/** 動物虐待事案のステータス（手続きの段階） */
export type AbuseStatus =
  | "報道"
  | "捜査中"
  | "逮捕"
  | "書類送検"
  | "起訴"
  | "不起訴"
  | "有罪判決"
  | "無罪"
  | "その他";

/** 悪徳動物関連事業者のステータス（根拠となった手続きの段階） */
export type BadBusinessStatus =
  | "報道"
  | "行政指導"
  | "行政処分"
  | "捜査中"
  | "逮捕"
  | "書類送検"
  | "起訴"
  | "有罪判決"
  | "その他";

/** 優良動物関連事業者の掲載根拠の種類 */
export type GoodBusinessStatus = "公的表彰" | "公的認定" | "第三者認証" | "報道";

export type CaseStatus = AbuseStatus | BadBusinessStatus | GoodBusinessStatus;

type CaseBase = {
  slug: string;
  title: string;
  /** 一覧カード・概要欄に表示する要約 */
  summary: string;
  /** 都道府県・市区町村程度まで */
  region: string;
  animalType: string;
  /** ステータスの補足（例：「一審判決。確定の有無は確認できた報道に記載なし」） */
  statusNote?: string;
  timeline: TimelineEvent[];
  facts: Fact[];
  /** 現在の状況 */
  currentStatus: string;
  sources: Source[];
  /** 掲載内容の最終更新日（YYYY-MM-DD） */
  updatedAt: string;
};

export type AnimalAbuseCase = CaseBase & {
  category: "animal-abuse";
  status: AbuseStatus;
  /** 報道で実名が公表されている場合のみ */
  personName?: string;
  /** 発生日（期間の場合は表示用文字列） */
  occurredAt: string;
  /** 最初に確認できた報道日（YYYY-MM-DD） */
  reportedAt: string;
  /** その後の捜査・裁判等の進展 */
  legalProgress: string[];
};

export type BadBusinessCase = CaseBase & {
  category: "bad-business";
  status: BadBusinessStatus;
  businessName: string;
  businessType: string;
  /** 問題となった内容 */
  issues: string[];
  /** 行政処分。確認できない場合は空配列 */
  administrativeActions: string[];
  /** 逮捕・裁判等 */
  legalProgress: string[];
};

export type Certification = {
  name: string;
  /** 認定・表彰を行った機関 */
  grantor: string;
  /** YYYY-MM-DD */
  date: string;
  sourceIds: string[];
};

export type GoodBusinessCase = CaseBase & {
  category: "good-business";
  status: GoodBusinessStatus;
  businessName: string;
  businessType: string;
  /** 取り組み内容 */
  initiatives: string[];
  /** 掲載理由 */
  listingReason: string;
  certifications: Certification[];
};

export type Case = AnimalAbuseCase | BadBusinessCase | GoodBusinessCase;

export type CaseOf<C extends CategorySlug> = Extract<Case, { category: C }>;
