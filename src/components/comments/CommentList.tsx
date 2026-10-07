import { commentStatusLabels, commentStatusNotes, type CommentStatus, type PublicComment } from "@/lib/comments/types";

const statusStyles: Record<CommentStatus, string> = {
  investigating: "bg-amber-400/10 text-amber-200 ring-amber-300/30",
  verified: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/30",
  reference: "bg-indigo-400/10 text-indigo-200 ring-indigo-300/25",
  archived: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
  rejected: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
};

const dateFormat = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}>
      {commentStatusLabels[status]}
    </span>
  );
}

export function CommentList({ comments }: { comments: PublicComment[] }) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        寄せられた情報 <span className="font-mono text-slate-300">{comments.length}</span>件
      </p>
      {comments.length === 0 ? (
        <p className="panel rounded-xl border-dashed p-8 text-center text-sm text-slate-500">
          まだ情報提供はありません。
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentItem({ comment }: { comment: PublicComment }) {
  return (
    <article className="panel rounded-xl p-5">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <CommentStatusBadge status={comment.status} />
        <time dateTime={comment.created_at} className="font-mono text-xs text-slate-400">
          {dateFormat.format(new Date(comment.created_at))} 投稿
        </time>
        <span className="ml-auto text-xs text-slate-500">{comment.display_name}</span>
      </header>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">{comment.body}</p>

      {(comment.source_url || comment.info_checked_at) && (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-line pt-3 text-xs">
          {comment.source_url && (
            <>
              <dt className="text-slate-500">情報源URL</dt>
              <dd className="break-all">
                <a
                  href={comment.source_url}
                  target="_blank"
                  rel="nofollow ugc noopener noreferrer"
                  className="font-mono text-cyan-300/80 hover:text-cyan-200"
                >
                  {comment.source_url}
                </a>
              </dd>
            </>
          )}
          {comment.info_checked_at && (
            <>
              <dt className="text-slate-500">投稿者の確認日時</dt>
              <dd className="text-slate-300">{dateTimeFormat.format(new Date(comment.info_checked_at))}</dd>
            </>
          )}
        </dl>
      )}

      <p className="mt-4 rounded-md bg-white/[0.02] px-3 py-2 text-xs text-slate-500 ring-1 ring-inset ring-line">
        {commentStatusNotes[comment.status]}
      </p>
    </article>
  );
}
