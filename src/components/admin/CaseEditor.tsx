"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { saveCase } from "@/lib/admin/case-actions";
import {
  emptyCase,
  newSourceKey,
  validateCase,
  type CaseFormValues,
  type FactForm,
  type SourceForm,
  type TimelineForm,
} from "@/lib/admin/case-form";
import { statusOptions } from "@/lib/cases/types";
import { publishStatusLabels, type PublishStatus } from "@/lib/cms/types";
import { categories, type CategorySlug } from "@/lib/site";
import { hintClass, inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";
import { RichTextEditor } from "./RichTextEditor";
import { ActionResult, Fieldset } from "./ui";

type Props = {
  initial: CaseFormValues;
  categoryLabels: Record<CategorySlug, string>;
  /** 基本情報の直後に表示する「2. 案件画像」（編集画面のみ。独立したフォームのため本文フォームの外に置く） */
  imagesSlot?: ReactNode;
};

export function CaseEditor({ initial, categoryLabels, imagesSlot }: Props) {
  const [state, formAction, pending] = useActionState(saveCase, { ok: false } as ActionState);
  const [v, setV] = useState<CaseFormValues>(initial);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const isNew = !v.id;

  const set = <K extends keyof CaseFormValues>(key: K, value: CaseFormValues[K]) => setV((prev) => ({ ...prev, [key]: value }));
  const text = (key: keyof CaseFormValues) => ({
    value: v[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
  });

  // 情報源を削除したときは、時系列・事実・認定からの参照も外す
  function setSources(sources: SourceForm[]) {
    const keys = new Set(sources.map((x) => x.key));
    setV((prev) => ({
      ...prev,
      sources,
      timeline: prev.timeline.map((t) => ({ ...t, source_keys: t.source_keys.filter((k) => keys.has(k)) })),
      facts: prev.facts.map((f) => ({ ...f, source_keys: f.source_keys.filter((k) => keys.has(k)) })),
      certifications: prev.certifications.map((c) => ({ ...c, sourceKeys: c.sourceKeys.filter((k) => keys.has(k)) })),
    }));
  }

  function changeCategory(category: CategorySlug) {
    // カテゴリ固有の項目は引き継がず、共通項目だけ残す
    const base = emptyCase(category);
    setV((prev) => ({ ...base, slug: prev.slug, title: prev.title, summary: prev.summary, region: prev.region, animal_type: prev.animal_type, current_status: prev.current_status, sources: prev.sources, timeline: prev.timeline, facts: prev.facts }));
  }

  function submit(formData: FormData) {
    const errors = validateCase(v);
    setClientErrors(errors);
    if (errors.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    formData.set("payload", JSON.stringify(v));
    formAction(formData);
  }

  const shownState: ActionState = clientErrors.length > 0 ? { ok: false, message: "入力内容を確認してください。", errors: clientErrors } : state;

  return (
    <div className="space-y-6">
      <ActionResult state={shownState} />

      {/* ── 公開ページの表示順に合わせて並べる ─────────────────────────────
          1 基本情報 → 2 案件画像 → 3 事件内容（優良事業者は掲載内容） → 4 現在の状況
          →（公開ページではここに情報提供コメント）→ 5 時系列 → 6 情報源・参考資料 → 7 掲載方針
          → 公開ページに表示しない管理項目 → 保存バー */}

      <Fieldset legend="1. 基本情報" description="公開ページ上部（カテゴリ・ステータス・タイトル、名前・地域・発生日のカード）に表示される項目です。">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="カテゴリ" hint={isNew ? undefined : "作成後は変更できません（URLとコメントの紐付けを保つため）。"}>
            <select
              value={v.category}
              disabled={!isNew}
              onChange={(e) => changeCategory(e.target.value as CategorySlug)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{categoryLabels[c.slug]}</option>
              ))}
            </select>
          </Field>
          <Field label="ステータス" hint="上部のバッジに表示。逮捕・起訴は有罪を意味しません。手続きの段階をそのまま選んでください。">
            <select value={v.case_status} onChange={(e) => set("case_status", e.target.value as never)} className={inputClass}>
              {statusOptions[v.category].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={v.category === "animal-abuse" ? "タイトル（事件名）" : "タイトル"} required>
          <input {...text("title")} required maxLength={200} className={inputClass} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          {v.category === "animal-abuse" ? (
            <Field label="名前（人物名）" hint="報道で実名が公表されている場合のみ。空欄ならカードは表示されません。">
              <input {...text("person_name")} className={inputClass} />
            </Field>
          ) : (
            <Field label="名前（事業者名）">
              <input {...text("business_name")} className={inputClass} />
            </Field>
          )}
          <Field label="地域" hint="都道府県・市区町村程度まで（番地は書かない）">
            <input {...text("region")} className={inputClass} />
          </Field>
          {v.category === "animal-abuse" && (
            <Field label="発生日" hint="期間でも可。例：2016年3月〜2017年4月">
              <input {...text("occurred_at")} className={inputClass} />
            </Field>
          )}
          <Field label="ステータスの補足" hint="基本情報カードの下に「※」付きで表示。例：一審判決。控訴の有無は情報源に記載なし。">
            <input {...text("status_note")} className={inputClass} />
          </Field>
        </div>

        <Field label="URL用ID（slug）" required hint={isNew ? "半角英小文字・数字・ハイフン。例：tokyo-dog-breeder-2026（作成後は変更できません）" : `URL：/${v.category}/${v.slug}`}>
          <input {...text("slug")} disabled={!isNew} required pattern="[a-z0-9][a-z0-9\-]*" className={`${inputClass} font-mono`} />
        </Field>
      </Fieldset>

      {imagesSlot ?? (
        <Fieldset legend="2. 案件画像">
          <p className="text-xs text-slate-500">案件を作成すると、ここで画像を登録できます。</p>
        </Fieldset>
      )}

      <Fieldset
        legend={v.category === "good-business" ? "3. 掲載内容" : "3. 事件内容"}
        description={
          v.category === "animal-abuse"
            ? "公開ページでは「事件名（タイトル）・対象となった動物・ステータス・概要」の順に表示されます。事件名とステータスは基本情報で編集します。"
            : v.category === "bad-business"
              ? "公開ページでは「業種・問題となった内容・行政処分・概要」の順に表示されます。"
              : "公開ページでは「事業者名・地域・業種・取り組み内容・掲載理由・認定・表彰等・概要」の順に表示されます。事業者名と地域は基本情報で編集します。根拠のない推薦はしないでください。"
        }
      >
        {v.category === "animal-abuse" && (
          <Field label="対象となった動物">
            <input {...text("animal_type")} className={inputClass} />
          </Field>
        )}
        {v.category !== "animal-abuse" && (
          <Field label="業種" hint="例：繁殖業者（ブリーダー）、ペットショップ">
            <input {...text("business_type")} className={inputClass} />
          </Field>
        )}
        {v.category === "bad-business" && (
          <>
            <LinesField label="問題となった内容（1行に1項目）" value={v.issues} onChange={(x) => set("issues", x)} />
            <LinesField label="行政処分（1行に1項目。空欄なら「情報源に記載なし」と表示）" value={v.administrative_actions} onChange={(x) => set("administrative_actions", x)} />
          </>
        )}
        {v.category === "good-business" && (
          <>
            <LinesField label="取り組み内容（1行に1項目）" value={v.initiatives} onChange={(x) => set("initiatives", x)} />
            <Field label="掲載理由">
              <textarea {...text("listing_reason")} rows={2} className={inputClass} />
            </Field>
            <ListEditor
              title="認定・表彰等"
              items={v.certifications}
              onChange={(x) => set("certifications", x)}
              create={() => ({ name: "", grantor: "", date: "", sourceKeys: [] })}
              render={(item, update) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="名称" className={inputClass} />
                  <input value={item.grantor} onChange={(e) => update({ ...item, grantor: e.target.value })} placeholder="認定・表彰した機関" className={inputClass} />
                  <input type="date" value={item.date} onChange={(e) => update({ ...item, date: e.target.value })} className={`${inputClass} [color-scheme:dark]`} />
                  <div className="sm:col-span-3">
                    <SourcePicker sources={v.sources} selected={item.sourceKeys} onChange={(keys) => update({ ...item, sourceKeys: keys })} />
                  </div>
                </div>
              )}
            />
          </>
        )}
        <RichTextEditor label="概要" value={v.summary} onChange={(x) => set("summary", x)} rows={5} hint="一覧カードには記号を除いた文章が表示されます。" />
      </Fieldset>

      <Fieldset legend="4. 現在の状況">
        <RichTextEditor label="現在の状況" value={v.current_status} onChange={(x) => set("current_status", x)} rows={4} />
      </Fieldset>

      <p className="rounded-lg border border-dashed border-line-strong px-4 py-3 text-xs leading-relaxed text-slate-500">
        公開ページでは、ここに「情報提供コメント」（ユーザー投稿）が表示されます。コメントの確認・ステータス変更は
        <Link href="/admin/comments" className="mx-1 text-cyan-300 hover:text-cyan-200">情報提供コメント</Link>
        で行います。
      </p>

      <Fieldset legend="5. 時系列" description="日付は YYYY / YYYY-MM / YYYY-MM-DD の形式。上下ボタンで並び替えできます。">
        <ListEditor<TimelineForm>
          title="時系列"
          items={v.timeline}
          onChange={(x) => set("timeline", x)}
          create={() => ({ event_date: "", date_note: "", title: "", description: "", source_keys: [] })}
          extraActions={
            <button
              type="button"
              onClick={() => set("timeline", [...v.timeline].sort((a, b) => a.event_date.localeCompare(b.event_date)))}
              className="text-xs text-cyan-300 hover:text-cyan-200"
            >
              日付順に並べ替え
            </button>
          }
          render={(t, update) => (
            <div className="grid gap-3 sm:grid-cols-[10rem_8rem_1fr]">
              <input value={t.event_date} onChange={(e) => update({ ...t, event_date: e.target.value })} placeholder="2026-01-01" className={`${inputClass} font-mono`} />
              <input value={t.date_note} onChange={(e) => update({ ...t, date_note: e.target.value })} placeholder="補足（上旬 等）" className={inputClass} />
              <input value={t.title} onChange={(e) => update({ ...t, title: e.target.value })} placeholder="見出し（例：○○が逮捕）" className={inputClass} />
              <textarea value={t.description} onChange={(e) => update({ ...t, description: e.target.value })} placeholder="説明（任意）" rows={2} className={`${inputClass} sm:col-span-3`} />
              <div className="sm:col-span-3">
                <SourcePicker sources={v.sources} selected={t.source_keys} onChange={(keys) => update({ ...t, source_keys: keys })} />
              </div>
            </div>
          )}
        />
      </Fieldset>

      <Fieldset legend="6. 情報源・参考資料" description="報道機関・公的機関の記事や発表のみ。番号［1］［2］…は本文の参照に使われます。公開するには1件以上必要です。">
        <ListEditor<SourceForm>
          title="情報源"
          numbered
          items={v.sources}
          onChange={setSources}
          create={() => ({ key: newSourceKey(), publisher: "", title: "", published_on: "", url: "", kind: "報道" })}
          render={(s, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={s.publisher} onChange={(e) => update({ ...s, publisher: e.target.value })} placeholder="媒体名・機関名" className={inputClass} />
              <select value={s.kind} onChange={(e) => update({ ...s, kind: e.target.value as SourceForm["kind"] })} className={inputClass}>
                <option value="報道">報道</option>
                <option value="公的機関">公的機関</option>
              </select>
              <input value={s.title} onChange={(e) => update({ ...s, title: e.target.value })} placeholder="記事タイトル" className={`${inputClass} sm:col-span-2`} />
              <input type="url" value={s.url} onChange={(e) => update({ ...s, url: e.target.value })} placeholder="https://" className={`${inputClass} font-mono`} />
              <input type="date" value={s.published_on} onChange={(e) => update({ ...s, published_on: e.target.value })} aria-label="公開日" className={`${inputClass} [color-scheme:dark]`} />
            </div>
          )}
        />
      </Fieldset>

      <Fieldset legend="7. NOTICE / 掲載方針">
        <p className="text-xs leading-relaxed text-slate-400">
          掲載方針はカテゴリ共通の文章のため、案件ごとには編集しません。
          <Link href={`/admin/pages/${v.category}`} className="mx-1 text-cyan-300 hover:text-cyan-200">
            TOP・カテゴリ「{categoryLabels[v.category]}」
          </Link>
          の「掲載方針（NOTICE）」で編集できます。
        </p>
      </Fieldset>

      <section className="space-y-6" aria-labelledby="hidden-items-heading">
        <h2 id="hidden-items-heading" className="flex items-center gap-3 text-xs font-semibold tracking-wide text-slate-400">
          公開ページに表示しない管理項目
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </h2>
        <Fieldset legend="非表示の項目" description="現在の公開ページには表示されませんが、データとして保存・編集できます。">
          {v.category === "animal-abuse" ? (
            <>
              <Field label="報道日" hint="確認できた最も古い報道の日付">
                <input type="date" {...text("reported_on")} className={`${inputClass} [color-scheme:dark]`} />
              </Field>
              <LinesField label="捜査・裁判等の進展（1行に1項目）" value={v.legal_progress} onChange={(x) => set("legal_progress", x)} />
            </>
          ) : (
            <Field label="対象動物">
              <input {...text("animal_type")} className={inputClass} />
            </Field>
          )}
          {v.category === "bad-business" && (
            <LinesField label="逮捕・裁判等（1行に1項目）" value={v.legal_progress} onChange={(x) => set("legal_progress", x)} />
          )}
        </Fieldset>
        <Fieldset legend="情報源で確認できる事項" description="情報源の番号と一緒に登録する事実の一覧です（公開ページには表示されません）。">
          <ListEditor<FactForm>
            title="事実"
            items={v.facts}
            onChange={(x) => set("facts", x)}
            create={() => ({ body: "", source_keys: [] })}
            render={(f, update) => (
              <div className="space-y-2">
                <textarea value={f.body} onChange={(e) => update({ ...f, body: e.target.value })} rows={2} className={inputClass} />
                <SourcePicker sources={v.sources} selected={f.source_keys} onChange={(keys) => update({ ...f, source_keys: keys })} />
              </div>
            )}
          />
        </Fieldset>
      </section>

      {/* 案件本文の保存。各項目は state で管理しているため、送信フォームは保存バーだけを囲む */}
      <form action={submit}>
        <div className="panel sticky bottom-4 z-10 flex flex-wrap items-end gap-4 rounded-xl p-4">
          <div>
            <label className={labelClass} htmlFor="publish-status">公開状態</label>
            <select id="publish-status" value={v.publish_status} onChange={(e) => set("publish_status", e.target.value as PublishStatus)} className={`${inputClass} w-36`}>
              {(Object.keys(publishStatusLabels) as PublishStatus[]).map((s) => (
                <option key={s} value={s}>{publishStatusLabels[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="updated-on">最終更新日</label>
            <input id="updated-on" type="date" {...text("content_updated_on")} className={`${inputClass} w-44 [color-scheme:dark]`} />
          </div>
          <button type="submit" disabled={pending} className={`${primaryButtonClass} ml-auto`}>
            {pending ? "保存中…" : isNew ? "作成する" : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required && <span className="ml-1 font-normal text-rose-300/80">必須</span>}
      </span>
      {children}
      {hint && <span className={`${hintClass} block`}>{hint}</span>}
    </label>
  );
}

function LinesField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <Field label={label}>
      <textarea value={value.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} rows={Math.max(3, value.length + 1)} className={inputClass} />
    </Field>
  );
}

/** 追加・削除・上下移動ができる一覧 */
function ListEditor<T>({
  title,
  items,
  onChange,
  create,
  render,
  numbered,
  extraActions,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, update: (item: T) => void) => ReactNode;
  numbered?: boolean;
  extraActions?: ReactNode;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };
  const iconButton = "flex h-7 w-7 items-center justify-center rounded text-slate-400 ring-1 ring-inset ring-line-strong hover:text-cyan-100 disabled:opacity-30";

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-xs text-slate-500">まだ登録がありません。</p>}
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-lg border border-line bg-night-2/40 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="font-mono text-xs text-cyan-300">{numbered ? `[${i + 1}]` : `#${i + 1}`}</span>
              <span className="ml-auto" />
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className={iconButton} aria-label={`${title}${i + 1}を上へ`}>↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className={iconButton} aria-label={`${title}${i + 1}を下へ`}>↓</button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className={`${iconButton} hover:text-rose-300`}
                aria-label={`${title}${i + 1}を削除`}
              >
                ✕
              </button>
            </div>
            {render(item, (updated) => onChange(items.map((x, j) => (j === i ? updated : x))))}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="rounded-lg border border-dashed border-cyan-300/40 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-400/[0.06]"
        >
          ＋ {title}を追加
        </button>
        {extraActions}
      </div>
    </div>
  );
}

/** 本文の各項目が参照する情報源を選ぶ */
function SourcePicker({ sources, selected, onChange }: { sources: SourceForm[]; selected: string[]; onChange: (keys: string[]) => void }) {
  if (sources.length === 0) return <p className="text-[11px] text-slate-600">情報源を登録すると参照を選べます。</p>;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-slate-500">根拠：</span>
      {sources.map((s, i) => {
        const on = selected.includes(s.key);
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? selected.filter((k) => k !== s.key) : [...selected, s.key])}
            className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset transition ${
              on ? "bg-cyan-400/15 text-cyan-100 ring-cyan-300/40" : "text-slate-500 ring-line-strong hover:text-slate-300"
            }`}
          >
            [{i + 1}] {s.publisher || "（媒体名未入力）"}
          </button>
        );
      })}
    </div>
  );
}
