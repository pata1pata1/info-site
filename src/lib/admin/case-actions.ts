"use server";

import { redirect } from "next/navigation";
import { CASE_IMAGE_BUCKET, caseImageRule, extensionByMime } from "../media/config";
import { ImageValidationError, readImageSize, sanitizeImage, type SanitizedImage } from "../media/sanitize";
import { requireAdminAction, type ActionState } from "./auth";
import { normalizeCase, validateCase, type CaseFormValues } from "./case-form";
import { revalidatePublicSite } from "./revalidate";

/** 案件の保存（新規作成・更新）。本文・情報源・時系列・事実を1トランザクションで保存する */
export async function saveCase(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let values: CaseFormValues;
  try {
    values = normalizeCase(JSON.parse(String(formData.get("payload"))) as CaseFormValues);
  } catch {
    return { ok: false, message: "送信内容を読み取れませんでした。" };
  }

  const errors = validateCase(values);
  if (errors.length > 0) return { ok: false, message: "入力内容を確認してください。", errors };

  let id: string;
  try {
    const { supabase } = await requireAdminAction();
    const { data, error } = await supabase.rpc("admin_save_case", { payload: values });
    if (error) {
      if (error.code === "23505") return { ok: false, message: "同じカテゴリに同じURL用ID（slug）の案件があります。" };
      throw error;
    }
    id = data as string;
  } catch (e) {
    console.error("[admin] saveCase failed", e);
    return { ok: false, message: "保存に失敗しました。管理者権限とネットワークを確認してください。" };
  }

  revalidatePublicSite();
  if (!values.id) redirect(`/admin/cases/${id}?created=1`);
  return {
    ok: true,
    message: values.publish_status === "published" ? "保存しました（公開中）。" : "保存しました（サイトには表示されていません）。",
  };
}

export async function deleteCase(id: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminAction();
    const { data: row } = await supabase.from("cases").select("main_image_path").eq("id", id).maybeSingle();
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) throw error;
    if (row?.main_image_path) await supabase.storage.from(CASE_IMAGE_BUCKET).remove([row.main_image_path]);
  } catch (e) {
    console.error("[admin] deleteCase failed", e);
    return { ok: false, message: "削除に失敗しました。" };
  }
  revalidatePublicSite();
  redirect("/admin/cases?deleted=1");
}

const MAX_TEXT = 300;

/**
 * メイン画像の保存。新しい画像があれば検証・メタデータ除去のうえ cases/{caseId}/{uuid}.{ext} に保存し、
 * 古い画像を削除する。画像がなければ alt・キャプション・出典だけを更新する。
 */
export async function saveCaseImage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const caseId = String(formData.get("caseId") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const sourceName = String(formData.get("sourceName") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const file = formData.get("image");

  const errors: string[] = [];
  if (!alt) errors.push("代替テキスト（alt）を入力してください。画像の内容を説明する短い文です。");
  if ([alt, caption, sourceName].some((v) => v.length > MAX_TEXT)) errors.push(`各項目は${MAX_TEXT}文字以内にしてください。`);
  if (sourceUrl && !/^https?:\/\/\S+$/.test(sourceUrl)) errors.push("出典URLは http:// または https:// で始めてください。");
  if (errors.length > 0) return { ok: false, message: "入力内容を確認してください。", errors };

  try {
    const { supabase } = await requireAdminAction();
    const { data: current, error: loadError } = await supabase
      .from("cases")
      .select("main_image_path")
      .eq("id", caseId)
      .maybeSingle();
    if (loadError || !current) return { ok: false, message: "案件が見つかりません。" };

    const update: Record<string, string | number | null> = {
      main_image_alt: alt,
      main_image_caption: caption || null,
      main_image_source_name: sourceName || null,
      main_image_source_url: sourceUrl || null,
    };

    let oldPath: string | null = null;
    if (file instanceof File && file.size > 0) {
      if (file.size > caseImageRule.maxBytes) return { ok: false, message: "画像は10MB以下にしてください。" };
      let image: SanitizedImage;
      try {
        image = sanitizeImage(new Uint8Array(await file.arrayBuffer()));
      } catch (e) {
        if (e instanceof ImageValidationError) return { ok: false, message: "JPEG / PNG / WebP 以外の形式か、壊れたファイルです。" };
        throw e;
      }
      const path = `cases/${caseId}/${crypto.randomUUID()}.${extensionByMime[image.mimeType]}`;
      const { error: uploadError } = await supabase.storage
        .from(CASE_IMAGE_BUCKET)
        .upload(path, image.bytes, { contentType: image.mimeType, upsert: false, cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      const size = readImageSize(image);
      Object.assign(update, {
        main_image_path: path,
        main_image_width: size?.width ?? null,
        main_image_height: size?.height ?? null,
      });
      oldPath = current.main_image_path;
    } else if (!current.main_image_path) {
      return { ok: false, message: "画像ファイルを選択してください。" };
    }

    const { error } = await supabase.from("cases").update(update).eq("id", caseId);
    if (error) throw error;
    if (oldPath) await supabase.storage.from(CASE_IMAGE_BUCKET).remove([oldPath]);
  } catch (e) {
    console.error("[admin] saveCaseImage failed", e);
    return { ok: false, message: "画像の保存に失敗しました。" };
  }

  revalidatePublicSite();
  return { ok: true, message: "メイン画像を保存しました。" };
}

export async function removeCaseImage(caseId: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminAction();
    const { data: current } = await supabase.from("cases").select("main_image_path").eq("id", caseId).maybeSingle();
    const { error } = await supabase
      .from("cases")
      .update({
        main_image_path: null,
        main_image_alt: null,
        main_image_caption: null,
        main_image_source_name: null,
        main_image_source_url: null,
        main_image_width: null,
        main_image_height: null,
      })
      .eq("id", caseId);
    if (error) throw error;
    if (current?.main_image_path) await supabase.storage.from(CASE_IMAGE_BUCKET).remove([current.main_image_path]);
  } catch (e) {
    console.error("[admin] removeCaseImage failed", e);
    return { ok: false, message: "画像の削除に失敗しました。" };
  }
  revalidatePublicSite();
  return { ok: true, message: "メイン画像を削除しました。" };
}
