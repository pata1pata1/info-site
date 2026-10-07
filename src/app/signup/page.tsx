import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SetupNotice } from "@/components/auth/SetupNotice";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { safeNextPath } from "@/lib/comments/validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "会員登録", robots: { index: false } };

export default async function SignUpPage(props: PageProps<"/signup">) {
  const searchParams = await props.searchParams;
  const next = safeNextPath(searchParams.next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell
      title="会員登録"
      en="SIGN UP"
      lead="サイトの閲覧はどなたでも可能です。各ページの「情報提供コメント」へ書き込むには会員登録が必要です。登録後、確認メールのリンクを開くと登録が完了します。"
    >
      {isSupabaseConfigured() ? <SignUpForm next={next} /> : <SetupNotice />}
    </AuthShell>
  );
}
