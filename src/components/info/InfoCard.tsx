import Link from "next/link";
import type { CaseSummary } from "@/lib/cases";
import { formatDate } from "@/lib/format";
import { getCategory } from "@/lib/site";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";

type Props = {
  item: CaseSummary;
  showCategory?: boolean;
};

export function InfoCard({ item, showCategory = false }: Props) {
  const category = getCategory(item.category);

  return (
    <Link
      href={item.href}
      className="panel panel-glow group relative flex h-full flex-col overflow-hidden rounded-xl"
    >
      <div className={`h-0.5 w-full ${category.theme.accentBar}`} aria-hidden="true" />
      <article className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {showCategory && <CategoryBadge slug={item.category} />}
          <StatusBadge status={item.status} />
          <time dateTime={item.updatedAt} className="ml-auto font-mono text-xs text-slate-500">
            更新 {formatDate(item.updatedAt)}
          </time>
        </div>

        <h3 className="mt-3 text-base font-bold leading-snug text-slate-50 transition-colors group-hover:text-cyan-100">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300">
          {item.summary}
        </p>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-line pt-4 text-xs">
          {item.subjectName && (
            <>
              <dt className="text-slate-500">{item.subjectLabel}</dt>
              <dd className="font-medium text-slate-100">{item.subjectName}</dd>
            </>
          )}
          <dt className="text-slate-500">地域</dt>
          <dd className="text-slate-300">{item.region}</dd>
          <dt className="text-slate-500">動物種別</dt>
          <dd className="text-slate-300">{item.animalType}</dd>
        </dl>
        <span className="mt-4 text-xs font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200">
          詳細を見る
          <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </article>
    </Link>
  );
}
