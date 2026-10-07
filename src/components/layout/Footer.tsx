import Link from "next/link";
import { navItems, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-line bg-night-2/60">
      <div className="glow-line absolute inset-x-0 top-0 opacity-40" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-md">
            <p className="text-base font-bold tracking-wide text-slate-50">{siteConfig.name}</p>
            <p className="mt-1 text-sm text-cyan-300/80">{siteConfig.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {siteConfig.description}
            </p>
          </div>
          <nav aria-label="フッターナビゲーション">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 transition-colors hover:text-cyan-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-slate-500">
          掲載情報は報道・公的機関の発表・寄せられた情報などをもとに整理したものです。
          個別情報ページには、各ページ下部に記載した情報源で確認できた内容のみを掲載しています。
        </p>
        <p className="mt-2 text-xs text-slate-600">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
