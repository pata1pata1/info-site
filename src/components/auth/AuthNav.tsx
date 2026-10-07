"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Status = "loading" | "signed-in" | "signed-out";

/** ヘッダーのログイン状態表示。ページを静的に保つため、クライアント側でセッションを確認する */
export function AuthNav() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setStatus(data.session ? "signed-in" : "signed-out"));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setStatus(session ? "signed-in" : "signed-out"),
    );
    return () => data.subscription.unsubscribe();
    // サーバー側でのログイン後（リダイレクト）にも状態を取り直す
  }, [pathname]);

  if (!isSupabaseConfigured() || status === "loading") return null;

  const linkClass =
    "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm";

  if (status === "signed-in") {
    return (
      <Link href="/account" className={`${linkClass} text-cyan-200 ring-1 ring-inset ring-cyan-300/25 hover:bg-cyan-400/10`}>
        マイページ
      </Link>
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
