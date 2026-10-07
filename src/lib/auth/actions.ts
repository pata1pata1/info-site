"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeNextPath } from "../comments/validation";
import { siteOrigin } from "../site-origin";
import { createClient } from "../supabase/server";

export type AuthFormState = {
  ok: boolean;
  message?: string;
  email?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const DISPLAY_NAME_MAX = 30;

const unavailable: AuthFormState = { ok: false, message: "現在、会員機能は利用できません（準備中）。" };

function validateDisplayName(value: string): string | null {
  if (value.length > DISPLAY_NAME_MAX) return `表示名は${DISPLAY_NAME_MAX}文字以内で入力してください。`;
  if (EMAIL_PATTERN.test(value) || value.includes("@")) return "表示名にメールアドレスは使用できません。";
  return null;
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const next = safeNextPath(formData.get("next"));

  if (!EMAIL_PATTERN.test(email)) return { ok: false, message: "メールアドレスの形式が正しくありません。", email };
  if (password.length < PASSWORD_MIN) {
    return { ok: false, message: `パスワードは${PASSWORD_MIN}文字以上で入力してください。`, email };
  }
  if (password !== passwordConfirm) return { ok: false, message: "確認用パスワードが一致しません。", email };
  const nameError = validateDisplayName(displayName);
  if (nameError) return { ok: false, message: nameError, email };
  if (formData.get("agreement") !== "on") return { ok: false, message: "利用上の注意への同意が必要です。", email };

  const supabase = await createClient();
  if (!supabase) return unavailable;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent(next)}`,
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) {
    console.error("[auth] signUp failed", error.message);
    return { ok: false, message: "会員登録に失敗しました。時間をおいて再度お試しください。", email };
  }

  // 登録済みメールアドレスかどうかは判別できないよう、常に同じ案内を返す
  return {
    ok: true,
    message: `${email} 宛てに確認メールを送信しました。メール内のリンクを開くと登録が完了します。`,
  };
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const supabase = await createClient();
  if (!supabase) return unavailable;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { ok: false, message: "メールアドレスの確認が完了していません。確認メールのリンクを開いてください。", email };
    }
    return { ok: false, message: "メールアドレスまたはパスワードが正しくありません。", email };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function updateDisplayName(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const nameError = validateDisplayName(displayName);
  if (nameError) return { ok: false, message: nameError };

  const supabase = await createClient();
  if (!supabase) return unavailable;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "ログインが必要です。" };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null, updated_at: new Date().toISOString() })
    .eq("id", auth.user.id);

  if (error) {
    console.error("[auth] updateDisplayName failed", error.message);
    return { ok: false, message: "表示名の更新に失敗しました。" };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: displayName ? "表示名を更新しました。" : "表示名を未設定（「登録ユーザー」表示）にしました。" };
}
