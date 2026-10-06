import { formatDate, type NewsItem } from "@/lib/dummy-data";

const labelStyles: Record<NewsItem["label"], string> = {
  お知らせ: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/30",
  更新: "bg-blue-400/10 text-blue-200 ring-blue-300/25",
  メンテナンス: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
};

export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="panel divide-y divide-line overflow-hidden rounded-xl">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-cyan-400/[0.03] sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="flex shrink-0 items-center gap-3">
            <time dateTime={item.date} className="w-24 font-mono text-sm text-slate-500">
              {formatDate(item.date)}
            </time>
            <span className={`inline-flex w-24 justify-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${labelStyles[item.label]}`}>
              {item.label}
            </span>
          </div>
          <p className="text-sm text-slate-200">{item.title}</p>
        </li>
      ))}
    </ul>
  );
}
