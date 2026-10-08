import { statusOptions, type CaseStatus } from "../cases/types";
import type { CaseRow } from "../cases/mapper";
import type { PublishStatus } from "../cms/types";
import { categories, type CategorySlug } from "../site";

/** 管理画面の案件編集フォームの値（DB の admin_save_case に渡す形と同じ） */
export type SourceForm = {
  key: string;
  publisher: string;
  title: string;
  published_on: string;
  url: string;
  kind: "報道" | "公的機関";
};
export type TimelineForm = { event_date: string; date_note: string; title: string; description: string; source_keys: string[] };
export type FactForm = { body: string; source_keys: string[] };
export type CertificationForm = { name: string; grantor: string; date: string; sourceKeys: string[] };

export type CaseFormValues = {
  id?: string;
  category: CategorySlug;
  slug: string;
  title: string;
  summary: string;
  case_status: CaseStatus;
  status_note: string;
  person_name: string;
  business_name: string;
  business_type: string;
  region: string;
  animal_type: string;
  occurred_at: string;
  reported_on: string;
  current_status: string;
  issues: string[];
  administrative_actions: string[];
  legal_progress: string[];
  initiatives: string[];
  listing_reason: string;
  certifications: CertificationForm[];
  publish_status: PublishStatus;
  content_updated_on: string;
  sources: SourceForm[];
  timeline: TimelineForm[];
  facts: FactForm[];
  /**
   * 「アニマルポリス」欄（管理者専用。cases ではなく case_admin_notes に保存し、admin_save_case には渡さない）。
   * undefined のときは保存しない（読み込みに失敗した場合に既存の内容を空で上書きしないため）
   */
  animal_police_note?: string;
};

/** 「アニマルポリス」の上限（DB の check 制約と合わせる） */
export const ANIMAL_POLICE_NOTE_MAX = 10000;

export function todayJst(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
}

export function newSourceKey(): string {
  return `s-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyCase(category: CategorySlug): CaseFormValues {
  return {
    category,
    slug: "",
    title: "",
    summary: "",
    case_status: statusOptions[category][0],
    status_note: "",
    person_name: "",
    business_name: "",
    business_type: "",
    region: "",
    animal_type: "",
    occurred_at: "",
    reported_on: "",
    current_status: "",
    issues: [],
    administrative_actions: [],
    legal_progress: [],
    initiatives: [],
    listing_reason: "",
    certifications: [],
    publish_status: "draft",
    content_updated_on: todayJst(),
    sources: [],
    timeline: [],
    facts: [],
    animal_police_note: "",
  };
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

export function rowToForm(row: CaseRow, animalPoliceNote = ""): CaseFormValues {
  return {
    id: row.id,
    category: row.category,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    case_status: row.case_status,
    status_note: row.status_note ?? "",
    person_name: row.person_name ?? "",
    business_name: row.business_name ?? "",
    business_type: row.business_type ?? "",
    region: row.region,
    animal_type: row.animal_type,
    occurred_at: row.occurred_at ?? "",
    reported_on: row.reported_on ?? "",
    current_status: row.current_status,
    issues: row.issues,
    administrative_actions: row.administrative_actions,
    legal_progress: row.legal_progress,
    initiatives: row.initiatives,
    listing_reason: row.listing_reason ?? "",
    certifications: (row.certifications ?? []).map((c) => ({ ...c, sourceKeys: c.sourceKeys ?? [] })),
    publish_status: row.publish_status,
    content_updated_on: row.content_updated_on,
    sources: [...(row.case_sources ?? [])].sort(bySortOrder).map((s) => ({
      key: s.key,
      publisher: s.publisher,
      title: s.title,
      published_on: s.published_on ?? "",
      url: s.url,
      kind: s.kind,
    })),
    timeline: [...(row.case_timeline_events ?? [])].sort(bySortOrder).map((t) => ({
      event_date: t.event_date,
      date_note: t.date_note ?? "",
      title: t.title,
      description: t.description ?? "",
      source_keys: t.source_keys,
    })),
    facts: [...(row.case_facts ?? [])].sort(bySortOrder).map((f) => ({ body: f.body, source_keys: f.source_keys })),
    animal_police_note: animalPoliceNote,
  };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PARTIAL_DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;
const URL_PATTERN = /^https?:\/\/\S+$/;
const PUBLISH: PublishStatus[] = ["draft", "published", "private"];

/** 入力チェック。問題があればメッセージの配列を返す（サーバー側で必ず実行する） */
export function validateCase(v: CaseFormValues): string[] {
  const errors: string[] = [];
  if (!categories.some((c) => c.slug === v.category)) errors.push("カテゴリが正しくありません。");
  if (!SLUG.test(v.slug)) errors.push("URL用ID（slug）は半角英小文字・数字・ハイフンで入力してください（例：tokyo-dog-breeder-2026）。");
  if (!v.title.trim() || v.title.length > 200) errors.push("タイトルは1〜200文字で入力してください。");
  if (!(statusOptions[v.category] as readonly string[] | undefined)?.includes(v.case_status)) {
    errors.push("このカテゴリでは選べないステータスです。");
  }
  if (!PUBLISH.includes(v.publish_status)) errors.push("公開状態が正しくありません。");
  if (v.reported_on && !DATE.test(v.reported_on)) errors.push("報道日の形式が正しくありません。");
  if (!DATE.test(v.content_updated_on)) errors.push("最終更新日を入力してください。");

  const keys = new Set<string>();
  v.sources.forEach((s, i) => {
    const n = `情報源${i + 1}`;
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(s.key) || keys.has(s.key)) errors.push(`${n}の識別子が正しくありません。`);
    keys.add(s.key);
    if (!s.publisher.trim()) errors.push(`${n}の媒体名を入力してください。`);
    if (!s.title.trim()) errors.push(`${n}の記事タイトルを入力してください。`);
    if (!URL_PATTERN.test(s.url)) errors.push(`${n}のURLは http:// または https:// で始めてください。`);
    if (s.published_on && !DATE.test(s.published_on)) errors.push(`${n}の公開日の形式が正しくありません。`);
  });
  const checkRefs = (refs: string[], label: string) => {
    if (refs.some((k) => !keys.has(k))) errors.push(`${label}が削除済みの情報源を参照しています。`);
  };
  v.timeline.forEach((t, i) => {
    const n = `時系列${i + 1}`;
    if (!PARTIAL_DATE.test(t.event_date)) errors.push(`${n}の日付は YYYY / YYYY-MM / YYYY-MM-DD の形式で入力してください。`);
    if (!t.title.trim()) errors.push(`${n}の見出しを入力してください。`);
    checkRefs(t.source_keys, n);
  });
  v.facts.forEach((f, i) => {
    if (!f.body.trim()) errors.push(`確認されている事実${i + 1}の本文を入力してください。`);
    checkRefs(f.source_keys, `確認されている事実${i + 1}`);
  });
  v.certifications.forEach((c, i) => {
    if (!c.name.trim()) errors.push(`認定・表彰${i + 1}の名称を入力してください。`);
    if (c.date && !DATE.test(c.date)) errors.push(`認定・表彰${i + 1}の日付の形式が正しくありません。`);
    checkRefs(c.sourceKeys, `認定・表彰${i + 1}`);
  });
  if (v.publish_status === "published" && v.sources.length === 0) {
    errors.push("公開するには情報源を1件以上登録してください（報道・公的機関で確認できる情報のみ掲載するため）。");
  }
  return errors;
}

/** 空行・前後の空白を取り除いて保存用に整える */
export function normalizeCase(v: CaseFormValues): CaseFormValues {
  const lines = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);
  return {
    ...v,
    slug: v.slug.trim(),
    title: v.title.trim(),
    issues: lines(v.issues),
    administrative_actions: lines(v.administrative_actions),
    legal_progress: lines(v.legal_progress),
    initiatives: lines(v.initiatives),
    sources: v.sources.map((s) => ({ ...s, publisher: s.publisher.trim(), title: s.title.trim(), url: s.url.trim() })),
    timeline: v.timeline.map((t) => ({ ...t, event_date: t.event_date.trim(), title: t.title.trim() })),
    facts: v.facts.map((f) => ({ ...f, body: f.body.trim() })),
    animal_police_note: typeof v.animal_police_note === "string" ? v.animal_police_note.trim() : undefined,
  };
}
