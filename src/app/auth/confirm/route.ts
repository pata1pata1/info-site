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

  const loginUrl = (query: string) =>
    new URL(`/login?${query}${next !== "/" ? `&next=${encodeURIComponent(next)}` : ""}`, origin);

  const supabase = await createClient();
  // Supabase 側で確認に失敗した場合は error / error_code 付きで戻ってくる
  if (supabase && !searchParams.has("error") && !searchParams.has("error_code")) {
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) {
        // 確認で作られたセッションは破棄し、ログイン画面で改めてログインしてもらう
        await supabase.auth.signOut({ scope: "local" });
        return NextResponse.redirect(loginUrl("confirmed=1"));
      }
    } else if (code) {
      // code は Supabase がメール確認に成功したときだけ付けて戻すので、確認完了として扱う
      return NextResponse.redirect(loginUrl("confirmed=1"));
    }
  }

  return NextResponse.redirect(loginUrl("error=confirm"));
}
