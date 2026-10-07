import { CategoryCard } from "@/components/home/CategoryCard";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsList } from "@/components/home/NewsList";
import { SectionHeading } from "@/components/home/SectionHeading";
import { InfoCardGrid } from "@/components/info/InfoCardGrid";
import { getCasesByCategory, getRecentCases, toSummary } from "@/lib/cases";
import { newsItems } from "@/lib/news";
import { categories } from "@/lib/site";

export default function Home() {
  const recentItems = getRecentCases(6).map(toSummary);

  return (
    <>
      <HeroSection />

      <section id="categories" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12">
        <SectionHeading title="カテゴリから探す" />
        <ul className="grid gap-5 md:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryCard category={category} count={getCasesByCategory(category.slug).length} />
            </li>
          ))}
        </ul>
      </section>

      <section id="recent" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14">
        <SectionHeading title="最近追加された情報" description="各カテゴリに新しく掲載された情報です。" />
        <InfoCardGrid items={recentItems} showCategory />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <SectionHeading title="お知らせ" description="サイトからのお知らせ・更新情報です。" />
        <NewsList items={newsItems} />
      </section>
    </>
  );
}
