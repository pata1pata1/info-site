import { getCategory, type CategorySlug } from "../site";
import { animalAbuseCases } from "./animal-abuse";
import { badBusinessCases } from "./bad-business";
import { goodBusinessCases } from "./good-business";
import type { Case, CaseOf, CaseStatus } from "./types";

export type * from "./types";

const casesByCategory: { [C in CategorySlug]: CaseOf<C>[] } = {
  "animal-abuse": animalAbuseCases,
  "bad-business": badBusinessCases,
  "good-business": goodBusinessCases,
};

const byUpdatedDesc = (a: Case, b: Case) => b.updatedAt.localeCompare(a.updatedAt);

export function getCasesByCategory<C extends CategorySlug>(category: C): CaseOf<C>[] {
  return [...casesByCategory[category]].sort(byUpdatedDesc);
}

export function getCase<C extends CategorySlug>(category: C, slug: string): CaseOf<C> | undefined {
  return casesByCategory[category].find((c) => c.slug === slug);
}

export function getRecentCases(limit: number): Case[] {
  return Object.values(casesByCategory).flat().sort(byUpdatedDesc).slice(0, limit);
}

/** 一覧カードに表示するための共通形式 */
export type CaseSummary = {
  key: string;
  href: string;
  category: CategorySlug;
  title: string;
  summary: string;
  region: string;
  subjectLabel: string;
  subjectName?: string;
  animalType: string;
  status: CaseStatus;
  updatedAt: string;
};

export function toSummary(c: Case): CaseSummary {
  const base = {
    key: `${c.category}/${c.slug}`,
    href: `${getCategory(c.category).href}/${c.slug}`,
    category: c.category,
    title: c.title,
    summary: c.summary,
    region: c.region,
    animalType: c.animalType,
    status: c.status,
    updatedAt: c.updatedAt,
  };
  return c.category === "animal-abuse"
    ? { ...base, subjectLabel: "人物名", subjectName: c.personName ?? "非公表" }
    : { ...base, subjectLabel: "事業者名", subjectName: c.businessName };
}
