import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteContent } from "@/lib/cms/content";
import { toPlainText } from "@/lib/richtext";
import { categories } from "@/lib/site";
import "./globals.css";

// 管理画面での保存時は revalidatePath で即時更新する。DB を直接編集した場合もこの間隔で反映される
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { home } = await getSiteContent();
  return {
    title: {
      default: `${home.siteName} | ${home.tagline}`,
      template: `%s | ${home.siteName}`,
    },
    description: toPlainText(home.description),
    applicationName: home.siteName,
  };
}

export const viewport: Viewport = {
  themeColor: "#06090f",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const content = await getSiteContent();
  const navItems = [
    { href: "/", label: "TOP" },
    ...categories.map((c) => ({ href: c.href, label: content.categories[c.slug].title })),
  ];

  return (
    <html lang="ja" className="h-full scroll-smooth bg-night antialiased">
      <body className="flex min-h-full flex-col text-slate-300">
        <Header siteName={content.home.siteName} tagline={content.home.tagline} navItems={navItems} />
        <main className="flex-1">{children}</main>
        <Footer home={content.home} navItems={navItems} />
      </body>
    </html>
  );
}
