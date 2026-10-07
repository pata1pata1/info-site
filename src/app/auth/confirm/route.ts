import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/comments/validation";
import { createClient } from "@/lib/supabase/server";

/**
 * 確認メールのリンク先。
 * - token_hash 方式（推奨。メールテンプレートで {{ .TokenHash }} を使う）
 * - code 方式（Supabase 既定テンプレート {{ .ConfirmationURL }} からのリダイレクト）
 * のどちらにも対応する。
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  if (supabase) {
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(`/account?registered=1&next=${encodeURIComponent(next)}`, origin));
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(`/account?registered=1&next=${encodeURIComponent(next)}`, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=confirm", origin));
}
