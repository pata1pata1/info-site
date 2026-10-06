import type { InfoStatus } from "@/lib/dummy-data";

const styles: Record<InfoStatus, string> = {
  確認中: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
  情報提供あり: "bg-sky-400/10 text-sky-200 ring-sky-300/25",
  報道あり: "bg-indigo-400/10 text-indigo-200 ring-indigo-300/25",
  確認済み: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/30",
};

export function StatusBadge({ status }: { status: InfoStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
}
