import { categories, siteConfig, type CategorySlug } from "../site";
import type { CategoryContent, HomeContent, SiteContent } from "./types";

/**
 * ページ文章の初期値。
 * Supabase 未接続時の表示と、DB 初期データ（supabase/migrations/*_cms_seed.sql）の元データとして使う。
 * Supabase 接続後は管理画面（/admin/pages）で編集した内容が優先される。
 */
export const defaultHomeContent: HomeContent = {
  siteName: siteConfig.name,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  categoriesTitle: "カテゴリから探す",
  categoriesDescription: "",
  recentTitle: "最近追加された情報",
  recentDescription: "各カテゴリに新しく掲載された情報です。",
  newsTitle: "お知らせ",
  newsDescription: "サイトからのお知らせ・更新情報です。",
  footerNote:
    "掲載情報は報道・公的機関の発表・寄せられた情報などをもとに整理したものです。個別情報ページには、各ページ下部に記載した情報源で確認できた内容のみを掲載しています。",
};

const policies: Record<CategorySlug, string> = {
  "animal-abuse":
    "本カテゴリは報道機関・公的機関が公表した情報のみをもとに掲載しています。「逮捕」「書類送検」「起訴」は捜査・裁判の段階を示すもので、有罪が確定したことを意味しません。判決についても、確定の有無は情報源に記載がある場合のみ記載しています。",
  "bad-business":
    "本カテゴリは行政処分・公的発表・裁判・信頼できる報道など、客観的根拠が確認できる案件のみを掲載しています。口コミや評判のみを根拠とした掲載は行いません。逮捕・起訴は有罪が確定したことを意味しません。",
  "good-business":
    "本カテゴリは自治体・公的機関による認定や表彰、第三者機関の認証、信頼できる報道など、掲載理由が確認できる事業者・団体のみを掲載しています。当サイト独自の推薦ではありません。",
};

export const defaultCategoryContent = Object.fromEntries(
  categories.map((c) => [c.slug, { title: c.name, description: c.description, supplement: "", policy: policies[c.slug] }]),
) as Record<CategorySlug, CategoryContent>;

export const defaultSiteContent: SiteContent = {
  home: defaultHomeContent,
  categories: defaultCategoryContent,
};
