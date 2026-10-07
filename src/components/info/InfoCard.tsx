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

        {/* 名前（人物名／事業者名／団体名）と地域を目立たせる。動物種別は一覧では表示しない（詳細ページで表示） */}
        <dl className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 border-t border-line pt-4">
          {item.subjectName && (
            <>
              <dt className="text-[11px] tracking-wide text-slate-500">{item.subjectLabel}</dt>
              <dd
                className={`min-w-0 break-words ${
                  item.subjectName === "非公表" ? "text-sm font-medium text-slate-400" : "text-base font-bold leading-snug text-slate-50"
                }`}
              >
                {item.subjectName}
              </dd>
            </>
          )}
          {item.region && (
            <>
              <dt className="text-[11px] tracking-wide text-slate-500">地域</dt>
              <dd className="min-w-0 break-words text-sm font-medium text-slate-200">{item.region}</dd>
            </>
          )}
        </dl>
        <span className="mt-4 text-xs font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200">
          詳細を見る
          <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </article>
    </Link>
  );
}
