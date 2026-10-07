import { ATTACHMENT_BUCKET } from "../media/config";
import { createClient } from "../supabase/server";
import type { CategorySlug } from "../site";
import type { CommentAttachment, PublicComment } from "./types";

/** 添付画像の表示用署名URLの有効期限（秒）。ページは毎回サーバーで描画するため短めでよい */
const SIGNED_URL_TTL = 60 * 60;

/** 個別ページに表示するコメント（非公開・掲載終了・却下はビュー側で除外済み） */
export async function getPublicComments(category: CategorySlug, slug: string): Promise<PublicComment[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("public_comments")
    .select("id, category, case_slug, body, source_url, info_checked_at, status, created_at, display_name")
    .eq("category", category)
    .eq("case_slug", slug)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[comments] failed to load", error.message);
    return [];
  }

  const comments = data as Omit<PublicComment, "attachments">[];
  const attachments = await getAttachments(supabase, comments.map((c) => c.id));
  return comments.map((c) => ({ ...c, attachments: attachments.filter((a) => a.comment_id === c.id) }));
}

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

async function getAttachments(supabase: SupabaseServerClient, commentIds: string[]): Promise<CommentAttachment[]> {
  if (commentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("public_comment_attachments")
    .select("id, comment_id, storage_path, media_type, mime_type, width, height, sort_order, description")
    .in("comment_id", commentIds)
    .order("sort_order");

  if (error) {
    console.error("[comments] failed to load attachments", error.message);
    return [];
  }
  const rows = data as Omit<CommentAttachment, "url">[];
  if (rows.length === 0) return [];

  const { data: signed, error: signError } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrls(rows.map((r) => r.storage_path), SIGNED_URL_TTL);
  if (signError) console.error("[comments] failed to sign attachment urls", signError.message);

  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.error ? null : s.signedUrl]));
  return rows.map((r) => ({ ...r, url: urlByPath.get(r.storage_path) ?? null }));
}
