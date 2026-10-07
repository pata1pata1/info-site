import Link from "next/link";
import { JapanMapIcon } from "@/components/info/JapanMapIcon";

/** TOPページ「カテゴリから探す」の下に置く、都道府県から探すへの導線 */
export function PrefectureSearchCard() {
  return (
    <Link
      href="/prefectures"
      className="panel panel-glow group flex items-center gap-4 overflow-hidden rounded-xl p-5 sm:gap-5 sm:px-6"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/25">
        <JapanMapIcon />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-slate-50">都道府県から探す</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">
          47都道府県から地域を選んで、3カテゴリの掲載情報をまとめて確認できます。
        </p>
      </div>
      <span className="hidden shrink-0 text-sm font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200 sm:inline">
        都道府県一覧へ
        <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-cyan-300 sm:hidden">→</span>
    </Link>
  );
}
