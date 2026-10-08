import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { SetupNotice } from "@/components/auth/SetupNotice";
import { safeNextPath } from "@/lib/comments/validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "ログイン", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = safeNextPath(searchParams.next);
  if (await getCurrentUser()) redirect(next);

  // 確認メールのリンクを開いた後に来た場合の案内（登録自体は完了していることが多いため、エラーとしては扱わない）
  const notice =
    searchParams.confirmed === "1"
      ? "メールアドレスの確認が完了しました。登録したメールアドレスとパスワードでログインしてください。"
      : searchParams.error === "confirm"
        ? "会員登録がお済みの方は、そのままログインしてください。"
        : undefined;

  return (
    <AuthShell title="ログイン" en="SIGN IN" lead="情報提供コメントの書き込みには、メールアドレスでの会員登録とログインが必要です。">
      {isSupabaseConfigured() ? <LoginForm next={next} notice={notice} /> : <SetupNotice />}
    </AuthShell>
  );
}
