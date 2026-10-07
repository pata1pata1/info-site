"use client";

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
};

export function CaseEditor({ initial, categoryLabels }: Props) {
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
    <form action={submit} className="space-y-6">
      <ActionResult state={shownState} />

      <Fieldset legend="基本情報">
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
          <Field label="URL用ID（slug）" required hint={isNew ? "半角英小文字・数字・ハイフン。例：tokyo-dog-breeder-2026（作成後は変更できません）" : `URL：/${v.category}/${v.slug}`}>
            <input {...text("slug")} disabled={!isNew} required pattern="[a-z0-9][a-z0-9\-]*" className={`${inputClass} font-mono`} />
          </Field>
        </div>

        <Field label="タイトル" required>
          <input {...text("title")} required maxLength={200} className={inputClass} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="ステータス" hint="逮捕・起訴は有罪を意味しません。手続きの段階をそのまま選んでください。">
            <select value={v.case_status} onChange={(e) => set("case_status", e.target.value as never)} className={inputClass}>
              {statusOptions[v.category].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="ステータスの補足" hint="例：一審判決。控訴の有無は情報源に記載なし。">
            <input {...text("status_note")} className={inputClass} />
          </Field>
          <Field label={v.category === "animal-abuse" ? "発生地域" : "所在地・地域"} hint="都道府県・市区町村程度まで（番地は書かない）">
            <input {...text("region")} className={inputClass} />
          </Field>
          <Field label="対象動物">
            <input {...text("animal_type")} className={inputClass} />
          </Field>

          {v.category === "animal-abuse" ? (
            <>
              <Field label="人物名" hint="報道で実名が公表されている場合のみ。空欄なら「非公表」と表示されます。">
                <input {...text("person_name")} className={inputClass} />
              </Field>
              <Field label="発生日" hint="期間でも可。例：2016年3月〜2017年4月">
                <input {...text("occurred_at")} className={inputClass} />
              </Field>
              <Field label="報道日" hint="確認できた最も古い報道の日付">
                <input type="date" {...text("reported_on")} className={`${inputClass} [color-scheme:dark]`} />
              </Field>
            </>
          ) : (
            <>
              <Field label="事業者名">
                <input {...text("business_name")} className={inputClass} />
              </Field>
              <Field label="業種" hint="例：繁殖業者（ブリーダー）、ペットショップ">
                <input {...text("business_type")} className={inputClass} />
              </Field>
            </>
          )}
        </div>
      </Fieldset>

      <Fieldset legend="本文">
        <RichTextEditor label="概要" value={v.summary} onChange={(x) => set("summary", x)} rows={5} hint="一覧カードには記号を除いた文章が表示されます。" />
        <RichTextEditor label="現在の状況" value={v.current_status} onChange={(x) => set("current_status", x)} rows={4} />
      </Fieldset>

      {v.category === "animal-abuse" && (
        <Fieldset legend="捜査・裁判等の進展" description="1行に1項目。">
          <LinesField label="捜査・裁判等の進展" value={v.legal_progress} onChange={(x) => set("legal_progress", x)} />
        </Fieldset>
      )}
      {v.category === "bad-business" && (
        <Fieldset legend="問題・処分・裁判" description="それぞれ1行に1項目。空欄の項目は「情報源に記載なし」と表示されます。">
          <LinesField label="問題となった内容" value={v.issues} onChange={(x) => set("issues", x)} />
          <LinesField label="行政処分" value={v.administrative_actions} onChange={(x) => set("administrative_actions", x)} />
          <LinesField label="逮捕・裁判等" value={v.legal_progress} onChange={(x) => set("legal_progress", x)} />
        </Fieldset>
      )}
      {v.category === "good-business" && (
        <Fieldset legend="取り組み・掲載理由" description="根拠のない推薦はしないでください。認定・表彰・認証など確認できる理由を記載します。">
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
        </Fieldset>
      )}

      <Fieldset legend="情報源・参考資料" description="報道機関・公的機関の記事や発表のみ。番号［1］［2］…は本文の参照に使われます。公開するには1件以上必要です。">
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

      <Fieldset legend="時系列" description="日付は YYYY / YYYY-MM / YYYY-MM-DD の形式。上下ボタンで並び替えできます。">
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

      <Fieldset legend="確認されている事実" description="情報源で確認できる事項だけを、情報源の番号と一緒に登録します。">
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
