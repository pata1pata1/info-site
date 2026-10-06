import type { Metadata } from "next";
import { CategoryPage } from "@/components/info/CategoryPage";
import { getCategory } from "@/lib/site";

const category = getCategory("good-business");

export const metadata: Metadata = {
  title: category.name,
  description: category.description,
};

export default function GoodBusinessPage() {
  return <CategoryPage slug="good-business" />;
}
