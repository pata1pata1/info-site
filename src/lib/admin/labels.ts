import type { PageSlug, PublishStatus } from "../cms/types";

/** 管理画面で編集できる固定ページの名称 */
export const pageLabels: Record<PageSlug, string> = {
  home: "TOPページ・サイト共通（サイト名・キャッチフレーズ等）",
  "animal-abuse": "カテゴリ：動物虐待者情報",
  "bad-business": "カテゴリ：悪徳動物関連事業者",
  "good-business": "カテゴリ：優良動物関連事業者",
};

/** 公開状態バッジの配色 */
export const publishBadge: Record<PublishStatus, string> = {
  draft: "bg-amber-400/10 text-amber-200 ring-amber-300/30",
  published: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/30",
  private: "bg-slate-400/10 text-slate-300 ring-slate-400/25",
};
