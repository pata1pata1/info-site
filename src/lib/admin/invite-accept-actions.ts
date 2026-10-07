"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import type { ActionState } from "./auth";

const messages: Record<string, string> = {
  not_authenticated: "招待を受け取るにはログインが必要です。",
  email_not_confirmed: "メールアドレスの確認が完了していません。確認メールのリンクを開いてから、もう一度お試しください。",
  invalid: "この招待リンクは無効です。リンクが正しいか、管理者に確認してください。",
  already_used: "この招待リンクはすでに使用されています。",
  revoked: "この招待は取り消されています。",
  expired: "この招待リンクは有効期限が切れています。管理者に再発行を依頼してください。",
  email_mismatch: "この招待は別のメールアドレス宛てです。招待されたメールアドレスでログインし直してください。",
};

/**
 * 管理者招待の受け取り。照合（トークン・期限・使用状況・メールアドレス・メール確認）はすべて DB の関数で行う。
 * 招待されたメールアドレス本人がログインしている場合だけ admin_users に登録される。
 */
export async function acceptAdminInvite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return { ok: false, message: messages.invalid };

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "現在、会員機能は利用できません。" };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: messages.not_authenticated };

  const { data, error } = await supabase.rpc("accept_admin_invite", { p_token: token });
  if (error) {
    console.error("[admin] acceptAdminInvite failed", error.message);
    return { ok: false, message: "招待の受け取りに失敗しました。時間をおいて再度お試しください。" };
  }
  if (data !== "accepted") return { ok: false, message: messages[data as string] ?? messages.invalid };

  revalidatePath("/", "layout");
  redirect("/admin?welcome=1");
}
