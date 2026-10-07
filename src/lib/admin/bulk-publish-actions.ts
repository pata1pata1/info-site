"use server";

import { requireAdminAction, type ActionState } from "./auth";
import { loadAuditedCases } from "./case-audit-data";
import { revalidatePublicSite } from "./revalidate";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// "use server" ファイルは async 関数しか export できないため、上限は内部定数にする（DB 関数の上限と同じ）
const MAX_BULK_PUBLISH = 200;

/**
 * 選択した下書きを一括公開する（下書き → 公開 の一方向のみ）。
 * 1. サーバー側で管理者を確認
 * 2. 選択された案件を読み直し、全件が「下書き・必須エラーなし」であることを監査し直す（1件でも外れれば中止）
 * 3. DB 関数 admin_publish_cases で1トランザクションとして公開（DB 側でも管理者・下書き・必須項目を再確認）
 */
export async function publishSelectedCases(ids: string[]): Promise<ActionState & { published?: number }> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return { ok: false, message: "公開する案件が選択されていません。" };
  if (unique.length > MAX_BULK_PUBLISH) return { ok: false, message: `一度に公開できるのは${MAX_BULK_PUBLISH}件までです。` };
  if (!unique.every((id) => UUID.test(id))) return { ok: false, message: "選択内容が不正です。" };

  let published: number;
  try {
    const { supabase } = await requireAdminAction();

    const { rows, error } = await loadAuditedCases(supabase, unique);
    if (error) throw new Error(error);
    if (rows.length !== unique.length) {
      return { ok: false, message: "選択した案件の一部が見つかりませんでした。一覧を再読み込みしてください。何も公開していません。" };
    }
    const notDraft = rows.filter((r) => r.publish_status !== "draft");
    if (notDraft.length > 0) {
      return { ok: false, message: `下書きではない案件が${notDraft.length}件含まれています。一覧を再読み込みしてください。何も公開していません。` };
    }
    const blocked = rows.filter((r) => !r.audit.publishable);
    if (blocked.length > 0) {
      return {
        ok: false,
        message: `必須エラーのある案件が${blocked.length}件含まれています。何も公開していません。`,
        errors: blocked.map((r) => `${r.title}：${r.audit.issues.filter((i) => i.level === "error").map((i) => i.message).join("、")}`),
      };
    }

    const { data, error: rpcError } = await supabase.rpc("admin_publish_cases", { case_ids: unique });
    if (rpcError) {
      if (rpcError.code === "PGRST202") {
        return { ok: false, message: "一括公開用のDB関数がありません。マイグレーション 20261008000000_bulk_publish_cases.sql を実行してください。何も公開していません。" };
      }
      throw rpcError;
    }
    published = data as number;
  } catch (e) {
    console.error("[admin] publishSelectedCases failed", e);
    return { ok: false, message: "一括公開に失敗しました。何も公開されていません（DB側で全件取り消し）。管理者権限とネットワークを確認してください。" };
  }

  revalidatePublicSite();
  return { ok: true, published, message: `${published}件を公開しました。` };
}
