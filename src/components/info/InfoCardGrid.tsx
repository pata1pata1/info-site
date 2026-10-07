import type { CaseSummary } from "@/lib/cases";
import { InfoCard } from "./InfoCard";

type Props = {
  items: CaseSummary[];
  showCategory?: boolean;
  emptyMessage?: string;
};

export function InfoCardGrid({ items, showCategory = false, emptyMessage = "現在掲載している情報はありません。" }: Props) {
  if (items.length === 0) {
    return (
      <p className="panel rounded-xl border-dashed p-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.key}>
          <InfoCard item={item} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  );
}
