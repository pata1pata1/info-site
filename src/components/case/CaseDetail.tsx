import Link from "next/link";
import type { ReactNode } from "react";
import { CategoryBadge } from "@/components/info/CategoryBadge";
import { CategoryIcon } from "@/components/info/CategoryIcon";
import { StatusBadge } from "@/components/info/StatusBadge";
import type { Case, Source } from "@/lib/cases";
import { formatDate, formatDateJa } from "@/lib/format";
import { getSiteContent } from "@/lib/cms/content";
import { getCategory } from "@/lib/site";
import { getCurrentUser } from "@/lib/supabase/server";
import { getAnimalPoliceNoteForViewer } from "@/lib/admin/case-admin-notes";
import { RichText } from "@/components/ui/RichText";
import { CaseGallery } from "./CaseGallery";
import { CaseFacts } from "./CaseFacts";
import { CaseNotice } from "./CaseNotice";
import { DetailSection } from "./DetailSection";
import { SourceRefs } from "./SourceRefs";

type Props = {
  item: Case;
  /** 本文の後ろに差し込む領域（情報提供コメント欄など） */
  children?: ReactNode;
};

/**
 * 個別情報ページ共通のテンプレート。
 * パンくず → カテゴリ・ステータス → タイトル → 案件画像ギャラリー → 基本情報（名前・地域・発生日）
 * → 事件内容（優良事業者は「掲載内容」。概要を含む） → 現在の状況 → 情報提供コメント → 時系列 → 情報源・参考資料 → NOTICE / 掲載方針
 * 時系列・情報源・参考資料はログイン中のみ表示する（未ログイン時は見出しごと出さない）
 * 「アニマルポリス」は管理者のみ、事件内容の直前に表示する（管理者専用テーブル case_admin_notes から取得）
 */
export async function CaseDetail({ item, children }: Props) {
  const category = getCategory(item.category);
  const [content, user, animalPoliceNote] = await Promise.all([
    getSiteContent(),
    getCurrentUser(),
    // 管理者でログインしている場合だけ取得する（それ以外は null。取得自体も RLS で管理者に限られる）
    item.id ? getAnimalPoliceNoteForViewer(item.id) : null,
  ]);
  const text = content.categories[item.category];
  const isLoggedIn = Boolean(user);
  // 動物虐待者情報は人物名、事業者カテゴリは事業者名
  const subjectName = item.category === "animal-abuse" ? item.personName : item.businessName;
  // 発生日は動物虐待者情報の案件データにのみある
  const occurredAt = item.category === "animal-abuse" ? item.occurredAt : undefined;
  // 優良事業者は「事件」ではないため見出しを変える
  const detailHeading = item.category === "good-business" ? { title: "掲載内容", en: "LISTING DETAILS" } : { title: "事件内容", en: "CASE DETAILS" };
  // 未ログイン時は情報源を渡さず、本文中の [1] などの参照も出さない
  const sources = isLoggedIn ? item.sources : [];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-section">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 left-0 h-56 w-[36rem] max-w-full rounded-full bg-cyan-500/[0.07] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-4 py-10 md:py-14">
          <nav aria-label="パンくずリスト" className="text-xs text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-cyan-200">TOP</Link>
              </li>
              <li aria-hidden="true" className="text-slate-600">/</li>
              <li>
                <Link href={category.href} className="transition-colors hover:text-cyan-200">{text.title}</Link>
              </li>
              <li aria-hidden="true" className="text-slate-600">/</li>
              <li aria-current="page" className="line-clamp-1 text-slate-300">{item.title}</li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${category.theme.iconBg}`}>
              <CategoryIcon slug={item.category} size={18} />
            </span>
            <CategoryBadge slug={item.category} />
            <StatusBadge status={item.status} />
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-snug tracking-wide text-slate-50 md:text-3xl">
            {item.title}
          </h1>
          <div className={`mt-5 h-0.5 w-32 rounded-full ${category.theme.accentBar}`} aria-hidden="true" />

          <CaseGallery images={item.images ?? []} />

          {/* 基本情報（名前・地域・発生日）。値のない項目は表示しない。ステータスは上部のバッジで表示済み */}
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {subjectName && <HeaderMeta label="名前" value={subjectName} />}
            {item.region && <HeaderMeta label="地域" value={item.region} />}
            {occurredAt && <HeaderMeta label="発生日" value={occurredAt} />}
          </dl>
          {item.statusNote && (
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              <span className="mr-1 text-cyan-300/80">※</span>
              {item.statusNote}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
        {/* 管理者専用。管理者以外・未入力のときはセクション自体を描画しない */}
        {animalPoliceNote && (
          <DetailSection title="アニマルポリス" en="ANIMAL POLICE">
            <div className="panel rounded-xl p-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">{animalPoliceNote}</p>
            </div>
          </DetailSection>
        )}

        <DetailSection title={detailHeading.title} en={detailHeading.en}>
          <CaseFacts item={{ ...item, sources }} />
        </DetailSection>

        <DetailSection title="現在の状況" en="CURRENT STATUS">
          <div className="panel rounded-xl p-5">
            <div className="flex items-center gap-2">
              <StatusBadge status={item.status} />
              <span className="font-mono text-xs text-slate-500">{formatDate(item.updatedAt)} 時点</span>
            </div>
            <RichText source={item.currentStatus} className="mt-3 text-sm leading-relaxed text-slate-300" />
          </div>
        </DetailSection>

        {/* 情報提供コメント（ユーザー投稿）。運営が確認した本文とは区切って表示する */}
        {children && <div className="border-y border-line py-10">{children}</div>}

        {/* 時系列・情報源はログイン中のみ。未ログイン時は案内も出さず、セクション自体を描画しない */}
        {isLoggedIn && (
          <>
            <DetailSection title="時系列" en="TIMELINE">
              <ol className="relative space-y-6 border-l border-line-strong pl-6">
                {item.timeline.map((event) => (
                  <li key={`${event.date}-${event.title}`} className="relative">
                    <span
                      className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgb(103_232_249/0.7)]"
                      aria-hidden="true"
                    />
                    <p className="font-mono text-xs text-cyan-200/80">
                      <time dateTime={event.date}>{formatDateJa(event.date)}</time>
                      {event.dateNote && <span className="ml-1">{event.dateNote}</span>}
                    </p>
                    <p className="mt-1 font-bold text-slate-100">
                      {event.title}
                      <SourceRefs ids={event.sourceIds} sources={sources} />
                    </p>
                    {event.description && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{event.description}</p>
                    )}
                  </li>
                ))}
              </ol>
            </DetailSection>

            <DetailSection title="情報源・参考資料" en="SOURCES">
              <SourceList sources={sources} />
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                本ページは上記の情報源や確信的な証拠を元に作成しています。
                <br />
                尚、情報源のリンク先の記事は削除・有料化されている場合があります。
              </p>
            </DetailSection>
          </>
        )}

        <CaseNotice text={text.policy} />
      </div>
    </>
  );
}

function HeaderMeta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="panel rounded-lg px-3 py-2">
      <dt className="text-[11px] tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-100">{value}</dd>
    </div>
  );
}

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ol className="panel divide-y divide-line overflow-hidden rounded-xl">
      {sources.map((source, i) => (
        <li key={source.id} id={`source-${source.id}`} className="scroll-mt-24 px-5 py-4 target:bg-cyan-400/[0.05]">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-cyan-300">[{i + 1}]</span>
            <span className="font-semibold text-slate-200">{source.publisher}</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] text-slate-400 ring-1 ring-inset ring-line-strong">
              {source.kind}
            </span>
            {source.publishedAt && (
              <time dateTime={source.publishedAt} className="ml-auto font-mono text-slate-500">
                公開 {formatDate(source.publishedAt)}
              </time>
            )}
          </div>
          <p className="mt-1.5 text-sm text-slate-100">{source.title}</p>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all font-mono text-xs text-cyan-300/80 transition-colors hover:text-cyan-200"
          >
            {source.url}
          </a>
        </li>
      ))}
    </ol>
  );
}
