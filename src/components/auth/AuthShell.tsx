import type { ReactNode } from "react";

/** ログイン・会員登録・アカウントページ共通の枠 */
export function AuthShell({ title, en, lead, children }: { title: string; en: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-md px-4 py-12 md:py-16">
        <p className="font-mono text-[11px] tracking-[0.25em] text-cyan-200/60">{en}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-wide text-slate-50">{title}</h1>
        <div className="glow-line mt-4 w-32" aria-hidden="true" />
        {lead && <div className="mt-4 text-sm leading-relaxed text-slate-400">{lead}</div>}
        <div className="panel mt-8 rounded-xl p-6">{children}</div>
      </div>
    </section>
  );
}
