import type { CaseStatus } from "@/lib/cases";

// 手続きの段階ごとの色。判決・処分のような確定的な語でも赤系の強調はせず、落ち着いた色に留める
const styles: Record<CaseStatus, string> = {
  報道: "bg-indigo-400/10 text-indigo-200 ring-indigo-300/25",
  捜査中: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
  逮捕: "bg-amber-400/10 text-amber-200 ring-amber-300/25",
  書類送検: "bg-amber-400/10 text-amber-200 ring-amber-300/25",
  起訴: "bg-orange-400/10 text-orange-200 ring-orange-300/25",
  不起訴: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
  有罪判決: "bg-rose-400/10 text-rose-200 ring-rose-300/25",
  無罪: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
  行政指導: "bg-sky-400/10 text-sky-200 ring-sky-300/25",
  行政処分: "bg-orange-400/10 text-orange-200 ring-orange-300/25",
  その他: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
  公的表彰: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/30",
  公的認定: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/30",
  第三者認証: "bg-teal-400/10 text-teal-200 ring-teal-300/30",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
}
