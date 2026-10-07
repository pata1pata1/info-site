import { RichText } from "@/components/ui/RichText";

/** NOTICE / 掲載方針（文章は管理画面のカテゴリページ編集で変更できる） */
export function CaseNotice({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <aside className="rounded-xl border border-cyan-300/15 bg-cyan-400/[0.04] px-5 py-4 text-xs leading-relaxed text-slate-400">
      <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-cyan-200/70">NOTICE / 掲載方針</p>
      <RichText source={text} />
    </aside>
  );
}
