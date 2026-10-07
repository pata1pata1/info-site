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

  const initialMessage =
    searchParams.error === "confirm"
      ? "確認リンクが無効か、有効期限が切れています。再度ログインするか、会員登録をやり直してください。"
      : undefined;

  return (
    <AuthShell title="ログイン" en="SIGN IN" lead="情報提供コメントの書き込みには、メールアドレスでの会員登録とログインが必要です。">
      {isSupabaseConfigured() ? <LoginForm next={next} initialMessage={initialMessage} /> : <SetupNotice />}
    </AuthShell>
  );
}
