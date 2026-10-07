import { RichText } from "@/components/ui/RichText";
import type { NewsItem } from "@/lib/cms/types";
import { formatDate } from "@/lib/format";

const labelStyles: Record<NewsItem["label"], string> = {
  お知らせ: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/30",
  更新: "bg-blue-400/10 text-blue-200 ring-blue-300/25",
  メンテナンス: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
};

const rowClass = "flex flex-col gap-1.5 px-5 py-4 sm:flex-row sm:items-center sm:gap-4";

export function NewsList({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return <p className="panel rounded-xl p-6 text-center text-sm text-slate-500">現在お知らせはありません。</p>;
  }

  return (
    <ul className="panel divide-y divide-line overflow-hidden rounded-xl">
      {items.map((item) => {
        const head = (
          <>
            <div className="flex shrink-0 items-center gap-3">
              <time dateTime={item.date} className="w-24 font-mono text-sm text-slate-500">
                {formatDate(item.date)}
              </time>
              <span className={`inline-flex w-24 justify-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${labelStyles[item.label]}`}>
                {item.label}
              </span>
            </div>
            <p className="text-sm text-slate-200">{item.title}</p>
          </>
        );

        // 本文があるお知らせはクリックで開閉する
        return (
          <li key={item.id} className="transition-colors hover:bg-cyan-400/[0.03]">
            {item.body.trim() ? (
              <details className="group">
                <summary className={`${rowClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                  {head}
                  <span aria-hidden="true" className="ml-auto hidden text-xs text-cyan-300/70 transition group-open:rotate-180 sm:block">
                    ▾
                  </span>
                </summary>
                <RichText source={item.body} className="px-5 pb-5 text-sm leading-relaxed text-slate-300 sm:pl-[14.5rem]" />
              </details>
            ) : (
              <div className={rowClass}>{head}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
