import { formatDate, type InfoItem } from "@/lib/dummy-data";
import { getCategory } from "@/lib/site";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";

type Props = {
  item: InfoItem;
  showCategory?: boolean;
};

export function InfoCard({ item, showCategory = false }: Props) {
  const category = getCategory(item.category);
  const subject = item.businessName ?? item.personName;

  // 詳細ページは未実装のため、現段階ではリンクにしない
  return (
    <article className="panel panel-glow relative flex h-full flex-col overflow-hidden rounded-xl">
      <div className={`h-0.5 w-full ${category.theme.accentBar}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {showCategory && <CategoryBadge slug={item.category} />}
          <StatusBadge status={item.status} />
          <time dateTime={item.postedAt} className="ml-auto font-mono text-xs text-slate-500">
            {formatDate(item.postedAt)}
          </time>
        </div>

        <h3 className="mt-3 text-base font-bold leading-snug text-slate-50">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {item.summary}
        </p>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-line pt-4 text-xs">
          {subject && (
            <>
              <dt className="text-slate-500">{item.businessName ? "事業者名" : "人物名"}</dt>
              <dd className="font-medium text-slate-100">{subject}</dd>
            </>
          )}
          <dt className="text-slate-500">地域</dt>
          <dd className="text-slate-300">{item.region}</dd>
          <dt className="text-slate-500">動物種別</dt>
          <dd className="text-slate-300">{item.animalType}</dd>
        </dl>
      </div>
    </article>
  );
}
