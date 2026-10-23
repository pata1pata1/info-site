import { notFound } from "next/navigation";
import { getCase } from "@/lib/cases";

/**
 * 存在しない事案の URL に HTTP 404 を返すため、loading.tsx（Suspense）より外側のここで存在確認する。
 * page.tsx の notFound() は読み込み中画面のストリーミング開始後になり、ステータスが 200 のままになる。
 * getCase は cache() 済みなので、page.tsx・generateMetadata と合わせても DB の取得は1回。
 */
export default async function Layout(props: LayoutProps<"/animal-abuse/[slug]">) {
  const { slug } = await props.params;
  if (!(await getCase("animal-abuse", slug))) notFound();
  return props.children;
}
