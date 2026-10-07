import { revalidatePath } from "next/cache";

/** 公開サイト全体（TOP・カテゴリ一覧・個別ページ・ヘッダー/フッター）を再生成する */
export function revalidatePublicSite() {
  revalidatePath("/", "layout");
}
