import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { GlobalNav } from "./GlobalNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/75 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-300/30 transition group-hover:shadow-[0_0_16px_-2px_rgb(34_211_238/0.45)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="6" cy="9" r="2.2" />
              <circle cx="10" cy="5.5" r="2.2" />
              <circle cx="14" cy="5.5" r="2.2" />
              <circle cx="18" cy="9" r="2.2" />
              <path d="M12 11c-3 0-6 3.5-6 6.2 0 1.8 1.4 2.8 3 2.8 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.6 0 3-1 3-2.8C18 14.5 15 11 12 11z" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-wide text-slate-50">{siteConfig.name}</span>
            <span className="hidden text-[11px] tracking-wider text-cyan-200/60 sm:block">{siteConfig.tagline}</span>
          </span>
        </Link>
        <GlobalNav />
      </div>
      <div className="glow-line absolute inset-x-0 bottom-0 opacity-60" aria-hidden="true" />
    </header>
  );
}
