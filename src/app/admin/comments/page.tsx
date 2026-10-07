/* eslint-disable @next/next/no-img-element -- 期限付き署名URLの画像を表示する */
import type { Metadata } from "next";
import Link from "next/link";
import { CommentModeration } from "@/components/admin/CommentModeration";
import { CommentStatusBadge } from "@/components/comments/CommentList";
import { requireAdminPage } from "@/lib/admin/auth";
import { commentStatusLabels, type CommentStatus } from "@/lib/comments/types";
import { ATTACHMENT_BUCKET } from "@/lib/media/config";

export const metadata: Metadata = { title: "情報提供コメント" };

const dateTime = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium", timeStyle: "short" });

type CommentRow = {
  id: string;
  category: string;
  case_slug: string;
  user_id: string;
  body: string;
  source_url: string | null;
  info_checked_at: string | null;
  status: CommentStatus;
  is_hidden: boolean;
  created_at: string;
  comment_attachments: { id: string; storage_path: string; is_hidden: boolean; sort_order: number }[];
};

export default async function AdminComments(props: PageProps<"/admin/comments">) {
  const { supabase } = await requireAdminPage("/admin/comments");
  const searchParams = await props.searchParams;
  const status = (Object.keys(commentStatusLabels) as CommentStatus[]).find((s) => s === searchParams.status);

  let query = supabase
    .from("comments")
    .select("id, category, case_slug, user_id, body, source_url, info_checked_at, status, is_hidden, created_at, comment_attachments(id, storage_path, is_hidden, sort_order)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  const comments = (data ?? []) as CommentRow[];

  // 投稿者の表示名・案件名・添付画像の署名URLをまとめて取得する
  const userIds = [...new Set(comments.map((c) => c.user_id))];
  const slugs = [...new Set(comments.map((c) => c.case_slug))];
  const paths = comments.flatMap((c) => c.comment_attachments.map((a) => a.storage_path));
  const [{ data: profiles }, { data: cases }, signed] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, display_name").in("id", userIds) : Promise.resolve({ data: [] }),
    slugs.length ? supabase.from("cases").select("category, slug, title").in("slug", slugs) : Promise.resolve({ data: [] }),
    paths.length ? supabase.storage.from(ATTACHMENT_BUCKET).createSignedUrls(paths, 600) : Promise.resolve({ data: [] }),
  ]);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name as string | null]));
  const titleByKey = new Map((cases ?? []).map((c) => [`${c.category}/${c.slug}`, c.title as string]));
  const urlByPath = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));

  const tabs = [{ key: undefined, label: "すべて" }, ...(Object.keys(commentStatusLabels) as CommentStatus[]).map((s) => ({ key: s, label: commentStatusLabels[s] }))];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-50">情報提供コメント</h1>
      <p className="text-xs leading-relaxed text-slate-500">
        新規投稿は「調査中」として即時公開されています。内容と情報源を確認し、ステータスを変更してください。「非公開」にしたコメント、「掲載終了」「却下」のコメントはサイトに表示されません。
      </p>

      <nav className="flex flex-wrap gap-1 text-xs" aria-label="ステータスで絞り込み">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.key ? `/admin/comments?status=${tab.key}` : "/admin/comments"}
            className={`rounded-md px-3 py-1.5 ${status === tab.key ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-300/25" : "text-slate-400 hover:text-slate-200"}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {error && <p className="text-sm text-rose-300">読み込みに失敗しました：{error.message}</p>}
      {comments.length === 0 && <p className="panel rounded-xl p-6 text-center text-sm text-slate-500">該当するコメントはありません。</p>}

      <ul className="space-y-4">
        {comments.map((c) => {
          const key = `${c.category}/${c.case_slug}`;
          return (
            <li key={c.id} className={`panel space-y-3 rounded-xl p-5 ${c.is_hidden ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <CommentStatusBadge status={c.status} />
                {c.is_hidden && <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-rose-200 ring-1 ring-inset ring-rose-300/30">非公開</span>}
                <span className="font-mono text-slate-500">{dateTime.format(new Date(c.created_at))}</span>
                <span className="text-slate-400">{nameById.get(c.user_id) || "登録ユーザー"}</span>
                <a href={`/${key}`} target="_blank" className="ml-auto truncate text-cyan-300 hover:text-cyan-200">
                  {titleByKey.get(key) ?? key} ↗
                </a>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">{c.body}</p>
              {(c.source_url || c.info_checked_at) && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-xs">
                  {c.source_url && (
                    <>
                      <dt className="text-slate-500">情報源URL</dt>
                      <dd className="break-all">
                        <a href={c.source_url} target="_blank" rel="nofollow noopener noreferrer" className="font-mono text-cyan-300/80">{c.source_url}</a>
                      </dd>
                    </>
                  )}
                  {c.info_checked_at && (
                    <>
                      <dt className="text-slate-500">確認日時</dt>
                      <dd className="text-slate-300">{dateTime.format(new Date(c.info_checked_at))}</dd>
                    </>
                  )}
                </dl>
              )}
              {c.comment_attachments.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {[...c.comment_attachments].sort((a, b) => a.sort_order - b.sort_order).map((a) => {
                    const url = urlByPath.get(a.storage_path);
                    return (
                      <li key={a.id}>
                        {url ? (
                          <a href={url} target="_blank" className="block h-20 w-20 overflow-hidden rounded-lg ring-1 ring-line-strong">
                            <img src={url} alt="添付画像" className="h-full w-full object-cover" />
                          </a>
                        ) : (
                          <span className="flex h-20 w-20 items-center justify-center rounded-lg text-[10px] text-slate-500 ring-1 ring-line">表示不可</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="border-t border-line pt-3">
                <CommentModeration id={c.id} status={c.status} isHidden={c.is_hidden} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
