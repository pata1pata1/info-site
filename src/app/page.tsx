import { CategoryCard } from "@/components/home/CategoryCard";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsList } from "@/components/home/NewsList";
import { PrefectureSearchCard } from "@/components/home/PrefectureSearchCard";
import { SectionHeading } from "@/components/home/SectionHeading";
import { InfoCardGrid } from "@/components/info/InfoCardGrid";
import { listCaseSummaries } from "@/lib/cases";
import { getPublishedNews, getSiteContent } from "@/lib/cms/content";
import { categories } from "@/lib/site";

export default async function Home() {
  const [content, recentItems, news, counts] = await Promise.all([
    getSiteContent(),
    listCaseSummaries(undefined, 6),
    getPublishedNews(10),
    Promise.all(categories.map((c) => listCaseSummaries(c.slug).then((items) => items.length))),
  ]);
  const { home } = content;

  return (
    <>
      <HeroSection home={home} />

      <section id="categories" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12">
        <SectionHeading title={home.categoriesTitle} description={home.categoriesDescription} />
        <ul className="grid gap-5 md:grid-cols-3">
          {categories.map((category, i) => (
            <li key={category.slug}>
              <CategoryCard category={category} content={content.categories[category.slug]} count={counts[i]} />
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <PrefectureSearchCard />
        </div>
      </section>

      <section id="recent" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14">
        <SectionHeading title={home.recentTitle} description={home.recentDescription} />
        <InfoCardGrid items={recentItems} showCategory />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <SectionHeading title={home.newsTitle} description={home.newsDescription} />
        <NewsList items={news} />
      </section>
    </>
  );
}
