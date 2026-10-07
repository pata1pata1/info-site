import { createClient } from "../supabase/server";
import type { CategorySlug } from "../site";
import type { PublicComment } from "./types";

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
  return data as PublicComment[];
}
