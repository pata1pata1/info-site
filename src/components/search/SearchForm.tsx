import Form from "next/form";
import { SEARCH_MAX_LENGTH } from "@/lib/search";

type Props = {
  defaultValue?: string;
  className?: string;
};

/** 事案の検索窓（TOPヒーロー・検索結果ページで共通）。送信すると /search?q=… へクライアント遷移する */
export function SearchForm({ defaultValue = "", className = "" }: Props) {
  return (
    <Form action="/search" role="search" className={`flex w-full gap-2 ${className}`}>
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">事案を検索</span>
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          maxLength={SEARCH_MAX_LENGTH}
          placeholder="名前・事業者名・地域などで検索"
          autoComplete="off"
          enterKeyHint="search"
          className="h-11 w-full rounded-lg border border-line-strong bg-night-2/80 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-5 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
      >
        検索
      </button>
    </Form>
  );
}
