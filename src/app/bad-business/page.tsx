import type { Metadata } from "next";
import { CategoryPage } from "@/components/info/CategoryPage";
import { getSiteContent } from "@/lib/cms/content";
import { toPlainText } from "@/lib/richtext";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteContent()).categories["bad-business"];
  return { title: text.title, description: toPlainText(text.description) };
}

export default function Page() {
  return <CategoryPage slug="bad-business" />;
}
