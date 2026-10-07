"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export type NavItem = { href: string; label: string };

export function GlobalNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* PC */}
      <nav aria-label="グローバルナビゲーション" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-300/25"
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

      {/* スマートフォン */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-300 ring-1 ring-inset ring-line hover:bg-white/5 hover:text-cyan-200 md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="グローバルナビゲーション"
          className="absolute inset-x-0 top-full border-b border-line bg-night-2 shadow-[0_16px_32px_-12px_rgb(0_0_0/0.7)] backdrop-blur-md md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-3 py-3 text-base ${
                      active
                        ? "bg-cyan-400/10 font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-300/25"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
