"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { StatusBadge } from "@/components/info/StatusBadge";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import type { ActionState } from "@/lib/admin/auth";
import { publishSelectedCases } from "@/lib/admin/bulk-publish-actions";
import type { AuditedCaseRow } from "@/lib/admin/case-audit-data";
import { publishBadge } from "@/lib/admin/labels";
import type { CaseStatus } from "@/lib/cases";
import { publishStatusLabels, type PublishStatus } from "@/lib/cms/types";
import { formatDate } from "@/lib/format";
import { categories, type CategorySlug } from "@/lib/site";
import { ActionResult } from "./ui";

type Props = {
  /** 現在のフィルターで表示している案件だけ（非表示の案件は選択できない） */
  rows: AuditedCaseRow[];
  categoryTitles: Record<CategorySlug, string>;
};

const smallButton =
  "rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-line-strong transition hover:bg-cyan-400/[0.06] hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40";

/** 案件一覧（公開前監査の表示・複数選択・一括公開） */
export function CaseBulkPanel({ rows, categoryTitles }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<ActionState | null>(null);
  const [pending, startTransition] = useTransition();

  // 選択できるのは「下書き・必須エラーなし」の案件だけ
  const selectable = useMemo(() => rows.filter((r) => r.publish_status === "draft" && r.audit.publishable), [rows]);
  const drafts = rows.filter((r) => r.publish_status === "draft");
  const draftErrors = drafts.filter((r) => !r.audit.publishable).length;
  const draftWarnings = drafts.filter((r) => r.audit.publishable && r.audit.warningCount > 0).length;

  // 表示中の行に含まれるものだけを選択として扱う（念のため二重に絞る）
  const selectedRows = selectable.filter((r) => selected.has(r.id));
  const selectedWarnings = selectedRows.filter((r) => r.audit.warningCount > 0).length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const selectAllVisible = () => setSelected(new Set(selectable.map((r) => r.id)));
  const selectPublishableDrafts = () => setSelected(new Set(rows.filter((r) => r.publish_status === "draft" && r.audit.publishable).map((r) => r.id)));
  const clearSelection = () => setSelected(new Set());

  const openConfirm = () => {
    setResult(null);
    dialogRef.current?.showModal();
  };
  const publish = () =>
    startTransition(async () => {
      const res = await publishSelectedCases(selectedRows.map((r) => r.id));
      setResult(res);
      if (res.ok) {
        dialogRef.current?.close();
        clearSelection();
        router.refresh();
      }
    });

  return (
    <div className="space-y-4">
      {/* 操作バー：選択数と一括操作（スクロールしても見えるよう上部に固定） */}
      <div className="panel sticky top-16 z-10 space-y-3 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>
            表示中 <span className="font-mono text-slate-100">{rows.length}</span>件
          </span>
          <span>
            下書き <span className="font-mono text-slate-100">{drafts.length}</span>件
          </span>
          <span className="text-emerald-300">✓ 公開可能 <span className="font-mono">{selectable.length}</span></span>
          <span className="text-amber-200">⚠ うち警告あり <span className="font-mono">{draftWarnings}</span></span>
          <span className="text-rose-300">✕ 必須エラー <span className="font-mono">{draftErrors}</span></span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-100" aria-live="polite">
            <span className="font-mono text-cyan-200">{selectedRows.length}</span>件選択中
          </span>
          <button type="button" className={smallButton} onClick={selectAllVisible} disabled={selectable.length === 0}>
            表示中を全選択
          </button>
          <button type="button" className={smallButton} onClick={selectPublishableDrafts} disabled={selectable.length === 0}>
            公開可能な下書きを選択
          </button>
          <button type="button" className={smallButton} onClick={clearSelection} disabled={selectedRows.length === 0}>
            全選択解除
          </button>
          <button type="button" className={`${primaryButtonClass} ml-auto`} onClick={openConfirm} disabled={selectedRows.length === 0}>
            選択した案件を公開
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          チェックできるのは、表示中の「下書き」で必須エラーがない案件だけです。警告は確認推奨（意図的な空欄の場合あり）で、公開は可能です。
        </p>
        {result?.ok && <ActionResult state={result} />}
      </div>

      <ul className="panel divide-y divide-line overflow-hidden rounded-xl">
        {rows.length === 0 && <li className="p-6 text-center text-sm text-slate-500">案件はありません。</li>}
        {rows.map((row) => {
          const isDraft = row.publish_status === "draft";
          const canSelect = isDraft && row.audit.publishable;
          const errors = row.audit.issues.filter((i) => i.level === "error");
          const warnings = row.audit.issues.filter((i) => i.level === "warning");
          return (
            <li key={row.id} className="flex gap-3 px-4 py-4 sm:px-5">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  aria-label={`${row.title} を選択`}
                  className="h-4 w-4 accent-cyan-400 disabled:opacity-25"
                  checked={selected.has(row.id)}
                  disabled={!canSelect}
                  onChange={() => toggle(row.id)}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${publishBadge[row.publish_status as PublishStatus]}`}>
                    {publishStatusLabels[row.publish_status as PublishStatus]}
                  </span>
                  <StatusBadge status={row.case_status as CaseStatus} />
                  {isDraft && <AuditBadge errors={errors.length} warnings={warnings.length} />}
                  <span className="ml-auto shrink-0 font-mono text-xs text-slate-500">更新 {formatDate(row.content_updated_on)}</span>
                </div>
                <Link href={`/admin/cases/${row.id}`} className="block truncate text-sm font-medium text-slate-100 hover:text-cyan-100">
                  {row.title}
                </Link>
                <p className="truncate font-mono text-[11px] text-slate-500">
                  {categoryTitles[row.category as CategorySlug] ?? row.category} ・ /{row.category}/{row.slug}
                </p>
                {isDraft && (errors.length > 0 || warnings.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {errors.map((i) => (
                      <span key={i.code} className="rounded bg-rose-400/10 px-1.5 py-0.5 text-rose-200 ring-1 ring-inset ring-rose-300/25">
                        ✕ {i.message}
                      </span>
                    ))}
                    {warnings.map((i) => (
                      <span key={i.code} className="rounded bg-amber-400/[0.07] px-1.5 py-0.5 text-amber-100/90 ring-1 ring-inset ring-amber-300/20">
                        ⚠ {i.message}
                      </span>
                    ))}
                    <Link href={`/admin/cases/${row.id}`} className="ml-1 font-semibold text-cyan-300 hover:text-cyan-200">
                      編集する →
                    </Link>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* 公開確認ダイアログ（いきなり公開しない） */}
      <dialog
        ref={dialogRef}
        aria-labelledby="bulk-publish-title"
        className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-xl border border-line-strong bg-night-2 p-0 text-slate-200 backdrop:bg-night/80 backdrop:backdrop-blur-sm"
      >
        <div className="space-y-4 p-5 md:p-6">
          <h2 id="bulk-publish-title" className="text-base font-bold text-slate-50">
            公開する案件：<span className="font-mono">{selectedRows.length}</span>件
          </h2>
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
            {categories.map((c) => (
              <div key={c.slug} className="contents">
                <dt className="text-slate-400">{categoryTitles[c.slug]}</dt>
                <dd className="text-right font-mono text-slate-100">{selectedRows.filter((r) => r.category === c.slug).length}件</dd>
              </div>
            ))}
            <dt className="text-amber-200">⚠ 警告あり</dt>
            <dd className="text-right font-mono text-amber-200">{selectedWarnings}件</dd>
          </dl>
          <details className="rounded-lg bg-panel px-3 py-2 text-xs ring-1 ring-inset ring-line">
            <summary className="cursor-pointer text-slate-300">公開する案件の一覧を確認</summary>
            <ol className="mt-2 max-h-56 list-decimal space-y-1 overflow-y-auto pl-5 text-slate-300">
              {selectedRows.map((r) => (
                <li key={r.id}>
                  {r.title}
                  {r.audit.warningCount > 0 && <span className="ml-1 text-amber-200">（警告{r.audit.warningCount}）</span>}
                </li>
              ))}
            </ol>
          </details>
          <p className="text-sm text-slate-300">
            この<span className="font-mono">{selectedRows.length}</span>件を公開しますか？公開すると、サイトに表示されます。
          </p>
          {result && !result.ok && <ActionResult state={result} />}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={secondaryButtonClass} onClick={() => dialogRef.current?.close()} disabled={pending}>
              キャンセル
            </button>
            <button type="button" className={primaryButtonClass} onClick={publish} disabled={pending || selectedRows.length === 0}>
              {pending ? "公開しています…" : `${selectedRows.length}件を公開する`}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function AuditBadge({ errors, warnings }: { errors: number; warnings: number }) {
  if (errors > 0) {
    return <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-[11px] text-rose-200 ring-1 ring-inset ring-rose-300/30">✕ 必須エラー {errors}</span>;
  }
  if (warnings > 0) {
    return <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200 ring-1 ring-inset ring-amber-300/30">⚠ 警告 {warnings}</span>;
  }
  return <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-200 ring-1 ring-inset ring-emerald-300/30">✓ 公開可能</span>;
}
