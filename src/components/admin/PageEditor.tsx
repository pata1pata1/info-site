"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/admin/auth";
import { savePage } from "@/lib/admin/page-actions";
import type { PageSlug } from "@/lib/cms/types";
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { RichTextEditor } from "./RichTextEditor";
import { ActionResult, Fieldset } from "./ui";

export type PageField = {
  name: string;
  label: string;
  kind: "text" | "rich";
  required?: boolean;
  hint?: string;
  group: string;
};

type Props = {
  slug: PageSlug;
  fields: PageField[];
  initial: Record<string, string>;
  publicPath: string;
};

/** TOPページ・カテゴリページの文章編集（下書き保存 → 公開） */
export function PageEditor({ slug, fields, initial, publicPath }: Props) {
  const [state, formAction, pending] = useActionState(savePage, { ok: false } as ActionState);
  const [values, setValues] = useState(initial);
  const set = (name: string) => (value: string) => setValues((v) => ({ ...v, [name]: value }));
  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <ActionResult state={state} />

      {groups.map((group) => (
        <Fieldset key={group} legend={group}>
          {fields
            .filter((f) => f.group === group)
            .map((field) =>
              field.kind === "rich" ? (
                <RichTextEditor
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  value={values[field.name] ?? ""}
                  onChange={set(field.name)}
                  hint={field.hint}
                  required={field.required}
                  rows={4}
                />
              ) : (
                <div key={field.name}>
                  <label htmlFor={`f-${field.name}`} className={labelClass}>
                    {field.label}
                    {field.required && <span className="ml-1 font-normal text-rose-300/80">必須</span>}
                  </label>
                  <input
                    id={`f-${field.name}`}
                    name={field.name}
                    value={values[field.name] ?? ""}
                    onChange={(e) => set(field.name)(e.target.value)}
                    required={field.required}
                    maxLength={200}
                    className={inputClass}
                  />
                  {field.hint && <p className={hintClass}>{field.hint}</p>}
                </div>
              ),
            )}
        </Fieldset>
      ))}

      <div className="panel sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl p-4">
        <button type="submit" name="intent" value="draft" disabled={pending} className={secondaryButtonClass}>
          下書き保存
        </button>
        <button type="submit" name="intent" value="publish" disabled={pending} className={primaryButtonClass}>
          {pending ? "保存中…" : "公開する"}
        </button>
        <a href={publicPath} target="_blank" className="ml-auto text-xs text-slate-400 hover:text-cyan-200">
          公開中のページを見る ↗
        </a>
      </div>
    </form>
  );
}
