import type { CategorySlug } from "@/lib/site";

const notices: Record<CategorySlug, string> = {
  "animal-abuse":
    "本カテゴリは報道機関・公的機関が公表した情報のみをもとに掲載しています。「逮捕」「書類送検」「起訴」は捜査・裁判の段階を示すもので、有罪が確定したことを意味しません。判決についても、確定の有無は情報源に記載がある場合のみ記載しています。",
  "bad-business":
    "本カテゴリは行政処分・公的発表・裁判・信頼できる報道など、客観的根拠が確認できる案件のみを掲載しています。口コミや評判のみを根拠とした掲載は行いません。逮捕・起訴は有罪が確定したことを意味しません。",
  "good-business":
    "本カテゴリは自治体・公的機関による認定や表彰、第三者機関の認証、信頼できる報道など、掲載理由が確認できる事業者・団体のみを掲載しています。当サイト独自の推薦ではありません。",
};

export function CaseNotice({ category }: { category: CategorySlug }) {
  return (
    <aside className="rounded-xl border border-cyan-300/15 bg-cyan-400/[0.04] px-5 py-4 text-xs leading-relaxed text-slate-400">
      <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-cyan-200/70">NOTICE / 掲載方針</p>
      {notices[category]}
    </aside>
  );
}
