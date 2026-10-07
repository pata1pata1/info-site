import type { ReactNode } from "react";
import type { Case } from "@/lib/cases";
import { RichText } from "@/components/ui/RichText";
import { formatDateJa } from "@/lib/format";
import { SourceRefs } from "./SourceRefs";

/**
 * 「事件内容」（優良事業者は「掲載内容」）：カテゴリ別の項目（最後に概要）。
 * 名前・地域・発生日はページ上部の基本情報カードに表示しているため、ここには含めない。報道日は公開ページに表示しない（データは DB に残る）。
 * 「情報源で確認できる事項」（case_facts）は公開ページには表示しない（データは DB に残し、管理画面で編集できる）。
 */
export function CaseFacts({ item }: { item: Case }) {
  return (
    <dl className="panel divide-y divide-line overflow-hidden rounded-xl text-sm">
      {renderFields(item).map(([label, value]) => (
        <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="text-xs text-slate-500 sm:pt-0.5">{label}</dt>
          <dd className="text-slate-200">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderFields(item: Case): [string, ReactNode][] {
  switch (item.category) {
    case "animal-abuse":
      return [
        ["事件名", item.title],
        ["対象となった動物", item.animalType],
        ["ステータス", item.status],
        ["概要", <Summary key="s" source={item.summary} />],
      ];
    case "bad-business":
      // 事業者名・所在地は上部の基本情報カードに表示。逮捕・裁判等は公開ページに表示しない（データは DB に残る）
      return [
        ["業種", item.businessType],
        ["問題となった内容", <BulletList key="i" items={item.issues} />],
        [
          "行政処分",
          <BulletList
            key="a"
            items={item.administrativeActions}
            empty="本ページで確認した情報源には、行政処分に関する記載はありません。"
          />,
        ],
        ["概要", <Summary key="s" source={item.summary} />],
      ];
    case "good-business":
      return [
        ["事業者名", item.businessName],
        ["地域", item.region],
        ["業種", item.businessType],
        ["取り組み内容", <BulletList key="i" items={item.initiatives} />],
        ["掲載理由", item.listingReason],
        [
          "認定・表彰等",
          <ul key="c" className="space-y-1">
            {item.certifications.map((c) => (
              <li key={c.name}>
                {c.name}
                <span className="text-slate-400">（{c.grantor}・{formatDateJa(c.date)}）</span>
                <SourceRefs ids={c.sourceIds} sources={item.sources} />
              </li>
            ))}
          </ul>,
        ],
        ["概要", <Summary key="s" source={item.summary} />],
      ];
  }
}

function Summary({ source }: { source: string }) {
  if (!source.trim()) return <span className="text-slate-500">—</span>;
  return <RichText source={source} className="leading-relaxed" />;
}

function BulletList({ items, empty }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <span className="text-slate-500">{empty}</span>;
  return (
    <ul className="space-y-1">
      {items.map((text) => (
        <li key={text} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
