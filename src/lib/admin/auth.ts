import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "../supabase/server";

type ServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

export type AdminContext = { supabase: ServerClient; userId: string };

/**
 * 管理者かどうかをサーバー側で確認する（DB の is_admin() = admin_users への登録で判定）。
 * 画面の表示制御だけに頼らず、管理画面のページ・Server Action のすべてで呼び出す。
 * さらに DB 側の RLS でも管理者以外の更新・削除は拒否される。
 */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return null;
  return { supabase, userId: auth.user.id };
});

/** 管理画面のページ用：未ログインはログイン画面へ、管理者以外は 404 にする */
export async function requireAdminPage(path: string): Promise<AdminContext> {
  // 管理画面は常にリクエストごとに描画する（ビルド時に静的生成しない）
  await connection();
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=${encodeURIComponent(path)}`);

  const context = await getAdminContext();
  if (!context) notFound();
  return context;
}

export class ForbiddenError extends Error {}

/** Server Action 用：管理者でなければ例外にする */
export async function requireAdminAction(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) throw new ForbiddenError("forbidden");
  return context;
}

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: string[];
};
