import type { ReactNode } from "react";
import type { Case } from "@/lib/cases";
import { formatDateJa } from "@/lib/format";
import { SourceRefs } from "./SourceRefs";

/** 「確認されている事実」：カテゴリ別の基本項目＋情報源付きの事実一覧 */
export function CaseFacts({ item }: { item: Case }) {
  return (
    <div className="space-y-5">
      <dl className="panel divide-y divide-line overflow-hidden rounded-xl text-sm">
        {renderFields(item).map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="text-xs text-slate-500 sm:pt-0.5">{label}</dt>
            <dd className="text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-bold text-slate-200">
          {item.category === "bad-business" ? "報道内容" : "情報源で確認できる事項"}
        </h3>
        <ul className="space-y-2">
          {item.facts.map((fact) => (
            <li key={fact.text} className="flex gap-2 text-sm leading-relaxed text-slate-300">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-300/70" aria-hidden="true" />
              <span>
                {fact.text}
                <SourceRefs ids={fact.sourceIds} sources={item.sources} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function renderFields(item: Case): [string, ReactNode][] {
  switch (item.category) {
    case "animal-abuse":
      return [
        ["事件名", item.title],
        ["人物名", item.personName ?? "非公表（報道で実名が公表されていないため掲載しません）"],
        ["発生地域", item.region],
        ["対象となった動物", item.animalType],
        ["発生日", item.occurredAt],
        ["報道日", `${formatDateJa(item.reportedAt)}（本ページで確認した最も古い報道）`],
        ["ステータス", item.status],
        ["捜査・裁判等の進展", <BulletList key="p" items={item.legalProgress} />],
      ];
    case "bad-business":
      return [
        ["事業者名", item.businessName],
        ["所在地", item.region],
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
        ["逮捕・裁判等", <BulletList key="l" items={item.legalProgress} empty="情報源に記載はありません。" />],
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
      ];
  }
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
