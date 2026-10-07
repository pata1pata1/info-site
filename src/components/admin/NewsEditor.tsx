"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { saveNews } from "@/lib/admin/news-actions";
import { publishStatusLabels, type NewsLabel, type PublishStatus } from "@/lib/cms/types";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";
import { RichTextEditor } from "./RichTextEditor";
import { ActionResult, Fieldset } from "./ui";

export type NewsFormValues = {
  id?: string;
  title: string;
  body: string;
  label: NewsLabel;
  published_on: string;
  publish_status: PublishStatus;
};

const LABELS: NewsLabel[] = ["お知らせ", "更新", "メンテナンス"];

export function NewsEditor({ initial }: { initial: NewsFormValues }) {
  const [state, formAction, pending] = useActionState(saveNews, { ok: false } as ActionState);
  const [v, setV] = useState(initial);
  const bind = <K extends "title" | "published_on">(key: K) => ({
    name: key,
    value: v[key],
    onChange: (e: { target: { value: string } }) => setV((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <form action={formAction} className="space-y-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <ActionResult state={state} />
      <Fieldset legend="お知らせ">
        <label className="block">
          <span className={labelClass}>タイトル<span className="ml-1 font-normal text-rose-300/80">必須</span></span>
          <input {...bind("title")} required maxLength={200} className={inputClass} />
        </label>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>種別</span>
            <select name="label" value={v.label} onChange={(e) => setV((p) => ({ ...p, label: e.target.value as NewsLabel }))} className={inputClass}>
              {LABELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>公開日</span>
            <input type="date" {...bind("published_on")} required className={`${inputClass} [color-scheme:dark]`} />
          </label>
          <label className="block">
            <span className={labelClass}>公開状態</span>
            <select
              name="publish_status"
              value={v.publish_status}
              onChange={(e) => setV((p) => ({ ...p, publish_status: e.target.value as PublishStatus }))}
              className={inputClass}
            >
              {(Object.keys(publishStatusLabels) as PublishStatus[]).map((s) => (
                <option key={s} value={s}>{publishStatusLabels[s]}</option>
              ))}
            </select>
          </label>
        </div>
        <RichTextEditor
          name="body"
          label="本文"
          value={v.body}
          onChange={(body) => setV((p) => ({ ...p, body }))}
          rows={8}
          hint="TOPページでタイトルをクリックすると表示されます（空欄ならタイトルのみ）。"
        />
      </Fieldset>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "保存中…" : v.id ? "保存する" : "作成する"}
      </button>
    </form>
  );
}
