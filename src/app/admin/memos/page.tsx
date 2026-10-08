import type { Metadata } from "next";
import { MemoForm, MemoItem } from "@/components/admin/AdminMemos";
import { Fieldset } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin/auth";
import { listMemos } from "@/lib/admin/memos";

export const metadata: Metadata = { title: "管理者メモ" };

/** 管理者メモ（管理者のみ。取得関数・RLS でも管理者か確認している） */
export default async function AdminMemosPage() {
  const { supabase, userId } = await requireAdminPage("/admin/memos");
  const { memos, error } = await listMemos(supabase, 200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-50">管理者メモ</h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">管理者同士の申し送りや作業メモを共有できます。</p>
      </div>
      {error && (
        <p className="rounded-lg bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100 ring-1 ring-inset ring-amber-300/25">
          読み込みに失敗しました。Supabase で <code className="font-mono">20261008000001_admin_memos.sql</code> を実行済みか確認してください。（{error.message}）
        </p>
      )}

      <Fieldset legend="新しいメモ">
        <MemoForm />
      </Fieldset>

      {memos.length === 0 ? (
        <p className="panel rounded-xl p-6 text-center text-sm text-slate-500">メモはまだありません。</p>
      ) : (
        <ul className="panel divide-y divide-line overflow-hidden rounded-xl">
          {memos.map((memo) => (
            <MemoItem key={memo.id} memo={memo} editable={memo.author_user_id === userId} />
          ))}
        </ul>
      )}
    </div>
  );
}
