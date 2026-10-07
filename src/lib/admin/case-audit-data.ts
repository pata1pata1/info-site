import type { AdminContext } from "./auth";
import { auditCase, type AuditResult } from "./case-audit";

/** 管理画面の案件一覧・一括公開で使う行（監査結果付き） */
export type AuditedCaseRow = {
  id: string;
  category: string;
  slug: string;
  title: string;
  case_status: string;
  publish_status: string;
  content_updated_on: string;
  audit: AuditResult;
};

const CASE_COLUMNS =
  "id, category, slug, title, summary, case_status, publish_status, region, occurred_at, reported_on, current_status, person_name, business_name, issues, legal_progress, initiatives, listing_reason, certifications, content_updated_on, main_image_path, case_sources(url, kind), case_timeline_events(event_date)";

type Row = {
  id: string;
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
  content_updated_on: string;
  main_image_path: string | null;
  case_sources: { url: string | null; kind: string | null }[] | null;
  case_timeline_events: { event_date: string }[] | null;
  case_images?: { id: string }[] | null;
};

/**
 * 案件を監査用の項目付きで読み込む（ids を渡すとその案件だけ）。
 * case_images が無い環境（マイグレーション 20261007000004 未実行）でも動くよう、失敗したら画像なしで読み直す。
 */
export async function loadAuditedCases(supabase: AdminContext["supabase"], ids?: string[]) {
  const load = (columns: string) => {
    let query = supabase.from("cases").select(columns).order("updated_at", { ascending: false });
    if (ids) query = query.in("id", ids);
    return query;
  };

  let { data, error } = await load(`${CASE_COLUMNS}, case_images(id)`);
  if (error) ({ data, error } = await load(CASE_COLUMNS));
  if (error) return { rows: [] as AuditedCaseRow[], error: error.message };

  const rows = ((data ?? []) as unknown as Row[]).map((r): AuditedCaseRow => ({
    id: r.id,
    category: r.category,
    slug: r.slug,
    title: r.title,
    case_status: r.case_status,
    publish_status: r.publish_status,
    content_updated_on: r.content_updated_on,
    audit: auditCase({
      ...r,
      sources: r.case_sources ?? [],
      timelineCount: r.case_timeline_events?.length ?? 0,
      imageCount: r.case_images?.length ?? (r.main_image_path ? 1 : 0),
    }),
  }));
  return { rows, error: null };
}
