import type { CategorySlug } from "../site";

/** 公開状態：下書き / 公開 / 非公開 */
export type PublishStatus = "draft" | "published" | "private";

export const publishStatusLabels: Record<PublishStatus, string> = {
  draft: "下書き",
  published: "公開",
  private: "非公開",
};

/** 管理画面で編集する固定ページ */
export type PageSlug = "home" | CategorySlug;

/**
 * TOPページ・サイト共通の文章。
 * 説明文は簡易リッチテキスト（見出し・太字・リンク・箇条書き・改行。lib/richtext.ts）
 */
export type HomeContent = {
  siteName: string;
  tagline: string;
  /** サイト説明文（リッチテキスト） */
  description: string;
  categoriesTitle: string;
  categoriesDescription: string;
  recentTitle: string;
  recentDescription: string;
  newsTitle: string;
  newsDescription: string;
  /** フッター下部の注記（リッチテキスト） */
  footerNote: string;
};

/** カテゴリページの文章 */
export type CategoryContent = {
  title: string;
  /** 説明文（リッチテキスト） */
  description: string;
  /** 補足文（リッチテキスト・任意） */
  supplement: string;
  /** 掲載方針（NOTICE。リッチテキスト） */
  policy: string;
};

export type PageContentMap = {
  home: HomeContent;
  "animal-abuse": CategoryContent;
  "bad-business": CategoryContent;
  "good-business": CategoryContent;
};

export type SiteContent = {
  home: HomeContent;
  categories: Record<CategorySlug, CategoryContent>;
};

export type NewsLabel = "お知らせ" | "更新" | "メンテナンス";

export type NewsItem = {
  id: string;
  /** 公開日（YYYY-MM-DD） */
  date: string;
  label: NewsLabel;
  title: string;
  /** 本文（リッチテキスト） */
  body: string;
};
