import type { Metadata } from "next";
import { CategoryPage } from "@/components/info/CategoryPage";
import { getCategory } from "@/lib/site";

const category = getCategory("animal-abuse");

export const metadata: Metadata = {
  title: category.name,
  description: category.description,
};

export default function AnimalAbusePage() {
  return <CategoryPage slug="animal-abuse" />;
}
