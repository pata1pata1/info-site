/** サイト名などの初期値（Supabase 接続後は管理画面の「ページ文章」で編集した内容が優先される） */
export const siteConfig = {
  name: "スキャムオブザーブ",
  tagline: "動物が生きやすい社会へ",
  shortName: "info-site",
  description:
    "スキャムオブザーブは、動物に危害を加える動物虐待者に関する情報や、動物関連事業者（ペットショップ・ブリーダー・保護団体など）の評判・実態に関する情報を掲載する情報サイトです。",
};

export type CategorySlug = "animal-abuse" | "bad-business" | "good-business";

export type Category = {
  slug: CategorySlug;
  href: `/${CategorySlug}`;
  name: string;
  shortName: string;
  description: string;
  /** カテゴリごとの配色。カード上部のライン・アイコン・バッジに限定して使う（Tailwind のクラス名をそのまま記述しておく必要がある） */
  theme: {
    accentBar: string;
    badge: string;
    iconBg: string;
  };
};

export const categories: Category[] = [
  {
    slug: "animal-abuse",
    href: "/animal-abuse",
    name: "動物虐待者情報",
    shortName: "虐待者情報",
    description:
      "動物虐待に関する事案や、報道・公的機関の発表などをもとにした情報を掲載します。",
    theme: {
      accentBar: "bg-gradient-to-r from-red-500 via-red-500/40 to-transparent",
      badge: "bg-red-500/10 text-red-300 ring-red-400/30",
      iconBg: "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-400/25",
    },
  },
  {
    slug: "bad-business",
    href: "/bad-business",
    name: "悪徳動物関連事業者",
    shortName: "悪徳事業者",
    description:
      "ペットショップ・ブリーダー等、不適切な飼養や取引が指摘されている事業者の情報を掲載します。",
    theme: {
      accentBar: "bg-gradient-to-r from-orange-500 via-orange-500/40 to-transparent",
      badge: "bg-orange-500/10 text-orange-300 ring-orange-400/30",
      iconBg: "bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-400/25",
    },
  },
  {
    slug: "good-business",
    href: "/good-business",
    name: "優良動物関連事業者",
    shortName: "優良事業者",
    description:
      "適切な飼養環境や誠実な対応で評価されている動物関連事業者の情報を掲載します。",
    theme: {
      accentBar: "bg-gradient-to-r from-emerald-500 via-emerald-500/40 to-transparent",
      badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
      iconBg: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/25",
    },
  },
];

export function getCategory(slug: CategorySlug): Category {
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown category: ${slug}`);
  return category;
}

export const navItems: { href: string; label: string }[] = [
  { href: "/", label: "TOP" },
  ...categories.map((c) => ({ href: c.href, label: c.name })),
];
