"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/pages", label: "TOP・カテゴリ" },
  { href: "/admin/cases", label: "事案ページ" },
  { href: "/admin/news", label: "お知らせ" },
  { href: "/admin/comments", label: "情報提供コメント" },
  { href: "/admin/admins", label: "管理者" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="管理メニュー" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex gap-1 md:flex-col">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-cyan-400/10 font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-300/25"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
