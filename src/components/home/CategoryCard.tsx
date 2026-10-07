import Link from "next/link";
import { CategoryIcon } from "@/components/info/CategoryIcon";
import type { CategoryContent } from "@/lib/cms/types";
import { toPlainText } from "@/lib/richtext";
import type { Category } from "@/lib/site";

type Props = {
  category: Category;
  content: CategoryContent;
  count: number;
};

export function CategoryCard({ category, content, count }: Props) {
  return (
    <Link
      href={category.href}
      className="panel panel-glow group flex h-full flex-col overflow-hidden rounded-xl"
    >
      <div className={`h-0.5 w-full ${category.theme.accentBar}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${category.theme.iconBg}`}>
            <CategoryIcon slug={category.slug} />
          </span>
          <h3 className="text-lg font-bold text-slate-50">{content.title}</h3>
        </div>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">{toPlainText(content.description)}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="text-slate-500">
            掲載 <span className="font-mono text-slate-300">{count}</span>件
          </span>
          <span className="font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200">
            一覧を見る
            <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
