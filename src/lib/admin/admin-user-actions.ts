"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { siteOrigin } from "../site-origin";
import { requireAdminAction, type ActionState } from "./auth";

export type InviteState = ActionState & {
  /** 発行した招待リンク（この画面でのみ表示。DB にはトークンのハッシュしか保存しない） */
  inviteUrl?: string;
  email?: string;
  expiresAt?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPIRY_DAYS = [1, 3, 7] as const;

function hashInviteToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * 管理者招待の作成。推測できないトークン（256bit）を生成し、DB にはハッシュだけを保存する。
 * 同じメールアドレスへの未使用の招待があれば取り消してから作り直す。
 */
export async function createAdminInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const days = Number(formData.get("expiresInDays"));
  if (!EMAIL_PATTERN.test(email)) return { ok: false, message: "メールアドレスの形式が正しくありません。" };
  if (!EXPIRY_DAYS.includes(days as (typeof EXPIRY_DAYS)[number])) return { ok: false, message: "有効期限を選んでください。" };

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { supabase, userId } = await requireAdminAction();

    const { data: admins } = await supabase.rpc("admin_list_admins");
    if ((admins ?? []).some((a: { email: string }) => a.email?.toLowerCase() === email)) {
      return { ok: false, message: "このメールアドレスはすでに管理者です。" };
    }

    const { error: revokeError } = await supabase
      .from("admin_invites")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("email", email)
      .eq("status", "pending");
    if (revokeError) throw revokeError;

    const { error } = await supabase.from("admin_invites").insert({
      email,
      token_hash: hashInviteToken(token),
      invited_by: userId,
      expires_at: expiresAt,
    });
    if (error) throw error;
  } catch (e) {
    console.error("[admin] createAdminInvite failed", e);
    return { ok: false, message: "招待の作成に失敗しました。" };
  }

  revalidatePath("/admin/admins");
  return {
    ok: true,
    message: "招待リンクを発行しました。下のリンクを招待する人に届けてください。",
    inviteUrl: `${await siteOrigin()}/admin-invite?token=${token}`,
    email,
    expiresAt,
  };
}

export async function revokeAdminInvite(id: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase
      .from("admin_invites")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "pending");
    if (error) throw error;
  } catch (e) {
    console.error("[admin] revokeAdminInvite failed", e);
    return { ok: false, message: "取り消しに失敗しました。" };
  }
  revalidatePath("/admin/admins");
  return { ok: true, message: "招待を取り消しました。" };
}

const removeMessages: Record<string, string> = {
  cannot_remove_self: "自分自身の管理者権限は解除できません。",
  last_admin: "管理者が0人になるため解除できません。",
  not_found: "この管理者は見つかりません。",
};

/** 管理者権限の解除。自分自身・最後の1人は DB 側の関数でも拒否される */
export async function removeAdmin(userId: string): Promise<ActionState> {
  try {
    const context = await requireAdminAction();
    if (context.userId === userId) return { ok: false, message: removeMessages.cannot_remove_self };
    const { data, error } = await context.supabase.rpc("admin_remove_admin", { p_user_id: userId });
    if (error) throw error;
    if (data !== "removed") return { ok: false, message: removeMessages[data as string] ?? "解除できませんでした。" };
  } catch (e) {
    console.error("[admin] removeAdmin failed", e);
    return { ok: false, message: "解除に失敗しました。" };
  }
  revalidatePath("/admin/admins");
  return { ok: true, message: "管理者権限を解除しました。" };
}
