import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "管理画面", template: "%s | 管理画面" },
  robots: { index: false, follow: false },
};

/** 管理画面共通レイアウト。管理者以外は 404（未ログインはログイン画面へ） */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdminPage("/admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-cyan-200/60">ADMIN CONSOLE</p>
          <p className="mt-1 text-lg font-bold tracking-wide text-slate-50">管理画面</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-100 ring-1 ring-inset ring-cyan-300/30 transition hover:bg-cyan-400/10"
        >
          サイトを見る →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
