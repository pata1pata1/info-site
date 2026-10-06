import { getCategory, type CategorySlug } from "@/lib/site";

export function CategoryBadge({ slug }: { slug: CategorySlug }) {
  const category = getCategory(slug);
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${category.theme.badge}`}
    >
      {category.shortName}
    </span>
  );
}
