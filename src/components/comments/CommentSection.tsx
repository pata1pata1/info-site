import Link from "next/link";
import { DetailSection } from "@/components/case/DetailSection";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { getPublicComments } from "@/lib/comments/queries";
import type { CategorySlug } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

type Props = {
  category: CategorySlug;
  slug: string;
};

/** 個別ページ下部の「情報提供コメント」欄 */
export async function CommentSection({ category, slug }: Props) {
  const configured = isSupabaseConfigured();
  const [user, comments] = await Promise.all([getCurrentUser(), getPublicComments(category, slug)]);
  const path = `/${category}/${slug}`;

  return (
    <DetailSection title="情報提供コメント" en="USER REPORTS">
      <div id="comments" className="scroll-mt-24 space-y-6">
        <aside className="rounded-xl border border-amber-300/20 bg-amber-400/[0.04] px-5 py-4 text-sm leading-relaxed text-slate-300">
          <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-amber-200/70">CAUTION / ご注意</p>
          この欄にはユーザーから寄せられた情報が掲載されます。
          <br />
          『調査中』と表示されている情報は、運営側で内容や情報源を確認している段階であり、事実として確認されたものではありません。
        </aside>

        {!configured ? (
          <p className="panel rounded-xl p-6 text-center text-sm text-slate-500">情報提供コメント機能は現在準備中です。</p>
        ) : user ? (
          <CommentForm category={category} slug={slug} />
        ) : (
          <div className="panel flex flex-col items-center gap-4 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-300">情報提供を書き込むにはログインまたは会員登録が必要です</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/login?next=${encodeURIComponent(path)}`} className={secondaryButtonClass}>ログイン</Link>
              <Link href={`/signup?next=${encodeURIComponent(path)}`} className={primaryButtonClass}>会員登録</Link>
            </div>
          </div>
        )}

        {configured && <CommentList comments={comments} />}
      </div>
    </DetailSection>
  );
}
