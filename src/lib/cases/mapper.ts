import type { CategorySlug } from "../site";
import type { Case, CaseStatus, Certification } from "./types";

export { CASE_IMAGE_BUCKET } from "../media/config";

/** cases テーブルの1行（子テーブルを含む select の結果） */
export type CaseRow = {
  id: string;
  category: CategorySlug;
  slug: string;
  title: string;
  summary: string;
  case_status: CaseStatus;
  status_note: string | null;
  person_name: string | null;
  business_name: string | null;
  business_type: string | null;
  region: string;
  animal_type: string;
  occurred_at: string | null;
  reported_on: string | null;
  current_status: string;
  issues: string[];
  administrative_actions: string[];
  legal_progress: string[];
  initiatives: string[];
  listing_reason: string | null;
  certifications: { name: string; grantor: string; date: string; sourceKeys?: string[] }[];
  /** 旧：メイン画像（1枚）。case_images へ移行済み。case_images が未作成の環境でのみ使う */
  main_image_path: string | null;
  main_image_alt: string | null;
  main_image_caption: string | null;
  main_image_source_name: string | null;
  main_image_source_url: string | null;
  main_image_width: number | null;
  main_image_height: number | null;
  publish_status: "draft" | "published" | "private";
  content_updated_on: string;
  updated_at: string;
  case_sources?: {
    key: string;
    publisher: string;
    title: string;
    published_on: string | null;
    url: string;
    kind: "報道" | "公的機関";
    sort_order: number;
  }[];
  case_timeline_events?: {
    event_date: string;
    date_note: string | null;
    title: string;
    description: string | null;
    source_keys: string[];
    sort_order: number;
  }[];
  case_facts?: { body: string; source_keys: string[]; sort_order: number }[];
  case_images?: CaseImageRow[];
};

export type CaseImageRow = {
  id: string;
  storage_path: string;
  alt: string;
  caption: string | null;
  source_name: string | null;
  source_url: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;
const opt = (v: string | null | undefined) => v || undefined;

/** DB の行を表示用の Case に変換する。publicUrl は Storage のパスから公開URLを作る関数 */
export function rowToCase(row: CaseRow, publicUrl: (path: string) => string): Case {
  // case_images が無い（マイグレーション前の）環境では旧メイン画像を1枚目として扱う
  const imageRows: CaseImageRow[] =
    row.case_images ??
    (row.main_image_path
      ? [{
          id: `legacy-${row.id}`,
          storage_path: row.main_image_path,
          alt: row.main_image_alt ?? "",
          caption: row.main_image_caption,
          source_name: row.main_image_source_name,
          source_url: row.main_image_source_url,
          width: row.main_image_width,
          height: row.main_image_height,
          sort_order: 0,
        }]
      : []);
  const certifications: Certification[] = (row.certifications ?? []).map((c) => ({
    name: c.name,
    grantor: c.grantor,
    date: c.date,
    sourceIds: c.sourceKeys ?? [],
  }));

  const base = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    region: row.region,
    animalType: row.animal_type,
    statusNote: opt(row.status_note),
    currentStatus: row.current_status,
    updatedAt: row.content_updated_on,
    images: [...imageRows].sort(bySortOrder).map((img) => ({
      id: img.id,
      url: publicUrl(img.storage_path),
      alt: img.alt || row.title,
      caption: opt(img.caption),
      sourceName: opt(img.source_name),
      sourceUrl: opt(img.source_url),
      width: img.width ?? undefined,
      height: img.height ?? undefined,
    })),
    sources: [...(row.case_sources ?? [])].sort(bySortOrder).map((s) => ({
      id: s.key,
      publisher: s.publisher,
      title: s.title,
      publishedAt: opt(s.published_on),
      url: s.url,
      kind: s.kind,
    })),
    timeline: [...(row.case_timeline_events ?? [])].sort(bySortOrder).map((t) => ({
      date: t.event_date,
      dateNote: opt(t.date_note),
      title: t.title,
      description: opt(t.description),
      sourceIds: t.source_keys,
    })),
    facts: [...(row.case_facts ?? [])].sort(bySortOrder).map((f) => ({ text: f.body, sourceIds: f.source_keys })),
  };

  switch (row.category) {
    case "animal-abuse":
      return {
        ...base,
        category: "animal-abuse",
        status: row.case_status as never,
        personName: opt(row.person_name),
        occurredAt: opt(row.occurred_at),
        reportedAt: opt(row.reported_on),
        legalProgress: row.legal_progress,
      };
    case "bad-business":
      return {
        ...base,
        category: "bad-business",
        status: row.case_status as never,
        businessName: row.business_name ?? "",
        businessType: row.business_type ?? "",
        issues: row.issues,
        administrativeActions: row.administrative_actions,
        legalProgress: row.legal_progress,
      };
    case "good-business":
      return {
        ...base,
        category: "good-business",
        status: row.case_status as never,
        businessName: row.business_name ?? "",
        businessType: row.business_type ?? "",
        initiatives: row.initiatives,
        listingReason: row.listing_reason ?? "",
        certifications,
      };
  }
}
