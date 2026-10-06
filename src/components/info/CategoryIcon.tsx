import type { CategorySlug } from "@/lib/site";

const paths: Record<CategorySlug, string> = {
  // 注意（三角）
  "animal-abuse": "M12 3l9.5 17h-19L12 3zm0 6v5m0 3v.01",
  // 店舗＋バツ印
  "bad-business": "M4 10h16v10H4zM3 6h18l-1 4H4L3 6zm6 7l6 5m0-5l-6 5",
  // 店舗＋チェック
  "good-business": "M4 10h16v10H4zM3 6h18l-1 4H4L3 6zm5.5 9l2.5 2.5 4.5-4.5",
};

export function CategoryIcon({ slug, size = 22 }: { slug: CategorySlug; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[slug]} />
    </svg>
  );
}
