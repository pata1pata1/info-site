import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { DisplayNameForm } from "@/components/auth/DisplayNameForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { SetupNotice } from "@/components/auth/SetupNotice";
import { FormMessage } from "@/components/ui/FormMessage";
import { secondaryButtonClass } from "@/components/ui/form-styles";
import { safeNextPath } from "@/lib/comments/validation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "マイページ", robots: { index: false } };

export default async function AccountPage(props: PageProps<"/account">) {
  const searchParams = await props.searchParams;
  const next = safeNextPath(searchParams.next);
  const supabase = await createClient();

  if (!supabase) {
    return (
      <AuthShell title="マイページ" en="ACCOUNT">
        <SetupNotice />
      </AuthShell>
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/account");

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", auth.user.id).maybeSingle();

  return (
    <AuthShell title="マイページ" en="ACCOUNT">
      <div className="space-y-6">
        {searchParams.registered === "1" && <FormMessage ok message="メールアドレスの確認が完了し、ログインしました。" />}

        <dl className="text-sm">
          <dt className="text-xs text-slate-500">メールアドレス（非公開）</dt>
          <dd className="mt-1 break-all font-mono text-slate-200">{auth.user.email}</dd>
        </dl>

        <div className="border-t border-line pt-6">
          <DisplayNameForm current={profile?.display_name ?? null} />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          {next !== "/" && (
            <Link href={next} className={secondaryButtonClass}>元のページに戻る</Link>
          )}
          <LogoutButton redirectTo="/" className={secondaryButtonClass} />
        </div>
      </div>
    </AuthShell>
  );
}
