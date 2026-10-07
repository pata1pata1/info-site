import type { Metadata } from "next";
import Link from "next/link";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { SetupNotice } from "@/components/auth/SetupNotice";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "管理者の招待",
  robots: { index: false, follow: false },
  // 招待トークンを含むURLを外部サイトへ送らない
  referrer: "no-referrer",
};

/**
 * 管理者招待の受け取りページ。
 * 招待された本人が会員登録・メール確認・ログインを済ませた状態でのみ受け取れる（照合は DB の関数で行う）。
 */
export default async function AdminInvitePage(props: PageProps<"/admin-invite">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  const here = `/admin-invite?token=${encodeURIComponent(token)}`;

  if (!isSupabaseConfigured()) {
    return (
      <AuthShell title="管理者の招待" en="ADMIN INVITATION">
        <SetupNotice />
      </AuthShell>
    );
  }
  if (!token) {
    return (
      <AuthShell title="管理者の招待" en="ADMIN INVITATION">
        <p className="text-sm text-slate-300">招待リンクが正しくありません。届いたリンクをそのまま開いてください。</p>
      </AuthShell>
    );
  }

  const user = await getCurrentUser();

  return (
    <AuthShell
      title="管理者の招待"
      en="ADMIN INVITATION"
      lead="スキャムオブザーブの管理者として招待されています。招待されたメールアドレスで会員登録・メール確認・ログインを済ませてから、招待を受け取ってください。"
    >
      {user ? (
        <div className="space-y-5">
          <dl className="text-sm">
            <dt className="text-xs text-slate-500">ログイン中のアカウント</dt>
            <dd className="mt-1 break-all font-mono text-slate-200">{user.email}</dd>
          </dl>
          {!user.email_confirmed_at && (
            <p className="text-xs text-amber-200">メールアドレスの確認が完了していません。確認メールのリンクを開いてください。</p>
          )}
          <AcceptInviteForm token={token} />
          <p className="text-xs leading-relaxed text-slate-500">
            招待されたメールアドレスと異なるアカウントでは受け取れません。別のアカウントでログインし直す場合は、
            ログアウトしてから、もう一度このリンクを開いてください。
          </p>
          <LogoutButton redirectTo={here} className={`${secondaryButtonClass} w-full`} />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-300">招待を受け取るには、招待されたメールアドレスでログインしてください。</p>
          <ol className="list-decimal space-y-1 pl-5 text-xs leading-relaxed text-slate-400">
            <li>アカウントがない場合は、招待されたメールアドレスで会員登録します</li>
            <li>確認メールのリンクを開いて登録を完了します</li>
            <li>ログインした状態で、もう一度この招待リンクを開きます</li>
          </ol>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/login?next=${encodeURIComponent(here)}`} className={`${primaryButtonClass} flex-1`}>
              ログイン
            </Link>
            <Link href={`/signup?next=${encodeURIComponent(here)}`} className={`${secondaryButtonClass} flex-1`}>
              会員登録
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
