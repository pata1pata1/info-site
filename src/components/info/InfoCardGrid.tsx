import type { InfoItem } from "@/lib/dummy-data";
import { InfoCard } from "./InfoCard";

type Props = {
  items: InfoItem[];
  showCategory?: boolean;
};

export function InfoCardGrid({ items, showCategory = false }: Props) {
  if (items.length === 0) {
    return (
      <p className="panel rounded-xl border-dashed p-10 text-center text-sm text-slate-500">
        現在掲載している情報はありません。
      </p>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <InfoCard item={item} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  );
}
