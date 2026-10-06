export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-cyan-300 to-blue-500" aria-hidden="true" />
        <h2 className="shrink-0 text-xl font-bold tracking-wide text-slate-50">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" aria-hidden="true" />
      </div>
      {description && <p className="mt-2 pl-4 text-sm text-slate-400">{description}</p>}
    </div>
  );
}
