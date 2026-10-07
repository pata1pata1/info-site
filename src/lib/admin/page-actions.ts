"use server";

import type { CategoryContent, HomeContent, PageSlug } from "../cms/types";
import { requireAdminAction, type ActionState } from "./auth";
import { revalidatePublicSite } from "./revalidate";

const PAGE_SLUGS: PageSlug[] = ["home", "animal-abuse", "bad-business", "good-business"];
const HOME_FIELDS: (keyof HomeContent)[] = [
  "siteName", "tagline", "description", "categoriesTitle", "categoriesDescription",
  "recentTitle", "recentDescription", "newsTitle", "newsDescription", "footerNote",
];
const CATEGORY_FIELDS: (keyof CategoryContent)[] = ["title", "description", "supplement", "policy"];
const REQUIRED = new Set(["siteName", "tagline", "title", "recentTitle", "newsTitle", "categoriesTitle"]);
const MAX_LENGTH = 5000;

/**
 * ページ文章の保存。intent=draft は下書きのみ、intent=publish は下書きを保存して公開中の内容にも反映する。
 */
export async function savePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = String(formData.get("slug")) as PageSlug;
  const intent = formData.get("intent") === "publish" ? "publish" : "draft";
  if (!PAGE_SLUGS.includes(slug)) return { ok: false, message: "ページが見つかりません。" };

  const fields = slug === "home" ? HOME_FIELDS : CATEGORY_FIELDS;
  const content: Record<string, string> = {};
  const errors: string[] = [];
  for (const field of fields) {
    const value = String(formData.get(field) ?? "").trim();
    if (REQUIRED.has(field) && !value) errors.push(`必須項目（${field}）が空です。`);
    if (value.length > MAX_LENGTH) errors.push(`${field} は${MAX_LENGTH}文字以内にしてください。`);
    content[field] = value;
  }
  if (errors.length > 0) return { ok: false, message: "入力内容を確認してください。", errors };

  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase.from("cms_page_drafts").upsert({ slug, content });
    if (error) throw error;
    if (intent === "publish") {
      const { error: publishError } = await supabase
        .from("cms_pages")
        .upsert({ slug, content, published_at: new Date().toISOString() });
      if (publishError) throw publishError;
      revalidatePublicSite();
    }
  } catch (e) {
    console.error("[admin] savePage failed", e);
    return { ok: false, message: "保存に失敗しました。管理者権限とネットワークを確認してください。" };
  }

  return {
    ok: true,
    message: intent === "publish" ? "公開しました。サイトに反映されています。" : "下書きを保存しました（サイトにはまだ反映されていません）。",
  };
}
