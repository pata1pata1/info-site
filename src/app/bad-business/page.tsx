import type { Metadata } from "next";
import { CategoryPage } from "@/components/info/CategoryPage";
import { getCategory } from "@/lib/site";

const category = getCategory("bad-business");

export const metadata: Metadata = {
  title: category.name,
  description: category.description,
};

export default function BadBusinessPage() {
  return <CategoryPage slug="bad-business" />;
}
