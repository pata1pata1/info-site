import type { ReactNode } from "react";

export function DetailSection({ title, en, children }: { title: string; en: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500" aria-hidden="true" />
        <h2 className="shrink-0 text-lg font-bold tracking-wide text-slate-50">{title}</h2>
        <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-cyan-200/50">{en}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}
