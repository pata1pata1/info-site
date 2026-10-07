import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";

export default async function AdminDashboard() {
  const { supabase } = await requireAdminPage("/admin");

  const count = async (table: string, filter?: [string, string]) => {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) query = query.eq(filter[0], filter[1]);
    const { count } = await query;
    return count ?? 0;
  };
  const [published, drafts, privateCases, investigating, news] = await Promise.all([
    count("cases", ["publish_status", "published"]),
    count("cases", ["publish_status", "draft"]),
    count("cases", ["publish_status", "private"]),
    count("comments", ["status", "investigating"]),
    count("news", ["publish_status", "published"]),
  ]);

  const cards = [
    { href: "/admin/cases", label: "公開中の案件", value: published, note: `下書き ${drafts}件・非公開 ${privateCases}件` },
    { href: "/admin/comments?status=investigating", label: "調査中のコメント", value: investigating, note: "確認してステータスを変更してください" },
    { href: "/admin/news", label: "公開中のお知らせ", value: news, note: "TOPページに表示されます" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-slate-50">ダッシュボード</h1>
      <ul className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}>
            <Link href={card.href} className="panel panel-glow block rounded-xl p-5">
              <p className="text-xs text-slate-400">{card.label}</p>
              <p className="mt-2 font-mono text-3xl text-cyan-100">{card.value}</p>
              <p className="mt-2 text-xs text-slate-500">{card.note}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="panel rounded-xl p-5 text-sm leading-relaxed text-slate-400">
        <h2 className="mb-2 font-bold text-slate-200">日常の運営</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/admin/pages" className="text-cyan-300 hover:text-cyan-200">ページ文章</Link>
            ：サイト名・キャッチフレーズ・TOPページとカテゴリページの文章（下書き保存→公開）
          </li>
          <li>
            <Link href="/admin/cases" className="text-cyan-300 hover:text-cyan-200">案件</Link>
            ：個別情報ページの作成・編集・公開、メイン画像、情報源・時系列の管理
          </li>
          <li>
            <Link href="/admin/news" className="text-cyan-300 hover:text-cyan-200">お知らせ</Link>
            ：TOPページの「お知らせ」
          </li>
          <li>
            <Link href="/admin/comments" className="text-cyan-300 hover:text-cyan-200">情報提供コメント</Link>
            ：ユーザー投稿の確認・ステータス変更・非公開化・削除
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">保存・公開した内容はすぐにサイトへ反映されます（再ビルドは不要です）。</p>
      </section>
    </div>
  );
}
