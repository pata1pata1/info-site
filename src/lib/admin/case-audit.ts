import { statusOptions } from "../cases/types";
import { categories, type CategorySlug } from "../site";

/**
 * 公開前監査。管理画面の一覧での表示と、一括公開時のサーバー側の再チェックの両方で使う。
 *
 * - error（必須エラー）：公開すると内容として成り立たない・掲載方針に反するもの。一括公開の対象にできない
 * - warning（確認推奨）：未確認のため意図的に空欄にしている場合があるもの。確認のうえ公開してよい
 */
export type AuditLevel = "error" | "warning";

export type AuditIssue = { level: AuditLevel; code: string; message: string };

export type AuditInput = {
  category: string;
  slug: string;
  title: string;
  summary: string;
  case_status: string;
  publish_status: string;
  region: string;
  occurred_at: string | null;
  reported_on: string | null;
  current_status: string;
  person_name: string | null;
  business_name: string | null;
  issues: string[] | null;
  legal_progress: string[] | null;
  initiatives: string[] | null;
  listing_reason: string | null;
  certifications: unknown[] | null;
  sources: { url: string | null; kind: string | null }[];
  timelineCount: number;
  imageCount: number;
};

export type AuditResult = {
  issues: AuditIssue[];
  errorCount: number;
  warningCount: number;
  /** 必須エラーがない下書き（一括公開の対象にできる） */
  publishable: boolean;
};

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;
const URL_PATTERN = /^https?:\/\/\S+$/;

const blank = (v: string | null | undefined) => !v || v.trim() === "";
const empty = (list: unknown[] | null | undefined) => !list || list.length === 0;

export function auditCase(c: AuditInput): AuditResult {
  const issues: AuditIssue[] = [];
  const error = (code: string, message: string) => issues.push({ level: "error", code, message });
  const warn = (code: string, message: string) => issues.push({ level: "warning", code, message });

  const category = categories.find((x) => x.slug === c.category)?.slug as CategorySlug | undefined;

  // ---- 共通：必須 ----
  if (blank(c.title)) error("title", "タイトルなし");
  if (blank(c.slug)) error("slug", "slugなし");
  else if (!SLUG_PATTERN.test(c.slug)) error("slug", "slugの形式が不正");
  if (!category) error("category", "カテゴリ不正");
  else if (!(statusOptions[category] as readonly string[]).includes(c.case_status)) error("case_status", "ステータスがカテゴリに合わない");
  if (blank(c.case_status)) error("case_status", "ステータスなし");
  if (blank(c.summary)) error("summary", "本文（概要）なし");
  if (c.sources.length === 0) error("sources", "情報源0件");
  else if (c.sources.some((s) => blank(s.url) || !URL_PATTERN.test(s.url!.trim()))) error("source_url", "URLのない情報源あり");
  if (c.publish_status !== "draft") error("publish_status", "下書きではない");

  // ---- 共通：確認推奨 ----
  if (blank(c.region)) warn("region", "地域未記載");
  if (blank(c.occurred_at) && blank(c.reported_on) && c.timelineCount === 0 && empty(c.certifications)) {
    warn("date", "日付情報なし");
  }
  if (blank(c.current_status)) warn("current_status", "現在の状況なし");
  if (c.timelineCount === 0) warn("timeline", "時系列なし");
  if (c.imageCount === 0) warn("image", "画像なし");

  // ---- カテゴリー固有 ----
  if (category === "animal-abuse") {
    if (blank(c.occurred_at)) warn("occurred_at", "発生日未確認");
    if (empty(c.issues) && empty(c.legal_progress) && c.timelineCount === 0) warn("detail", "事件内容不足");
    if (blank(c.person_name)) warn("person_name", "人物名未掲載");
  }
  if (category === "bad-business") {
    if (blank(c.occurred_at)) warn("occurred_at", "発生日未確認");
    if (blank(c.business_name)) warn("business_name", "事業者名未掲載（タイトル等で識別できるか確認）");
    if (empty(c.issues)) warn("issues", "問題となった内容が未記載");
  }
  if (category === "good-business") {
    if (blank(c.business_name)) error("business_name", "事業者・団体名なし");
    if (blank(c.listing_reason) && empty(c.certifications) && empty(c.initiatives)) error("basis", "優良と判断する根拠なし");
    if (!c.sources.some((s) => s.kind === "公的機関") && empty(c.certifications)) warn("official_source", "公的根拠の情報源なし");
  }

  const errorCount = issues.filter((i) => i.level === "error").length;
  return {
    issues,
    errorCount,
    warningCount: issues.length - errorCount,
    publishable: errorCount === 0,
  };
}
