/**
 * 事案詳細ページの読み込み中表示（各カテゴリの [slug]/loading.tsx から使う）。
 * クリック直後にすぐ画面が切り替わったと分かるよう、CaseDetail と同じ骨組みを淡いブロックで表示する。
 */
export function CaseDetailSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">事案ページを読み込んでいます…</p>

      <section className="relative overflow-hidden border-b border-line bg-section">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl animate-pulse px-4 py-10 md:py-14" aria-hidden="true">
          {/* パンくず */}
          <Block className="h-3 w-56" />
          {/* アイコン・バッジ */}
          <div className="mt-6 flex items-center gap-2">
            <Block className="h-8 w-8 rounded-lg" />
            <Block className="h-5 w-20 rounded-full" />
            <Block className="h-5 w-16 rounded-full" />
          </div>
          {/* タイトル（2行） */}
          <Block className="mt-5 h-7 w-full max-w-2xl" />
          <Block className="mt-3 h-7 w-2/3 max-w-md" />
          <div className="mt-5 h-0.5 w-32 rounded-full bg-cyan-400/30" />
          {/* 基本情報カード */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel rounded-lg px-3 py-2.5">
                <Block className="h-2.5 w-10" />
                <Block className="mt-2 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl animate-pulse space-y-10 px-4 py-10" aria-hidden="true">
        {[5, 3].map((lines, i) => (
          <section key={i}>
            {/* セクション見出し */}
            <div className="mb-4 flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-cyan-400/40" />
              <Block className="h-5 w-28" />
              <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
            </div>
            {/* 本文カード */}
            <div className="panel space-y-3 rounded-xl p-5">
              {Array.from({ length: lines }, (_, j) => (
                <Block key={j} className={`h-3.5 ${j === lines - 1 ? "w-3/5" : "w-full"}`} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Block({ className }: { className: string }) {
  return <div className={`rounded bg-slate-500/15 ${className}`} />;
}
