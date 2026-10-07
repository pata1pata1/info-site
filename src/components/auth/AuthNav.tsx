"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Status = "loading" | "signed-in" | "admin" | "signed-out";

/**
 * ヘッダーのログイン状態表示。ページを静的に保つため、クライアント側でセッションを確認する。
 * 管理者には「管理画面」も表示する（表示の出し分けのみ。/admin 自体はサーバー側と RLS で管理者を確認している）
 */
export function AuthNav() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let active = true;
    const update = async (signedIn: boolean) => {
      if (!signedIn) {
        if (active) setStatus("signed-out");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (active) setStatus(isAdmin === true ? "admin" : "signed-in");
    };
    supabase.auth.getSession().then(({ data }) => update(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      update(Boolean(session));
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
    // サーバー側でのログイン後（リダイレクト）にも状態を取り直す
  }, [pathname]);

  if (!isSupabaseConfigured() || status === "loading") return null;

  const linkClass =
    "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm";

  if (status === "signed-in" || status === "admin") {
    return (
      <div className="flex items-center gap-1">
        {status === "admin" && (
          <Link
            href="/admin"
            className={`${linkClass} border border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20`}
          >
            管理画面
          </Link>
        )}
        <Link href="/account" className={`${linkClass} text-cyan-200 ring-1 ring-inset ring-cyan-300/25 hover:bg-cyan-400/10`}>
          マイページ
        </Link>
      </div>
    );
  }

  const next = pathname.startsWith("/login") || pathname.startsWith("/signup") ? "/" : pathname;
  return (
    <div className="flex items-center gap-1">
      <Link href={`/login?next=${encodeURIComponent(next)}`} className={`${linkClass} text-slate-300 hover:bg-white/5 hover:text-slate-100`}>
        ログイン
      </Link>
      <Link
        href={`/signup?next=${encodeURIComponent(next)}`}
        className={`${linkClass} border border-cyan-300/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25`}
      >
        会員登録
      </Link>
    </div>
  );
}
