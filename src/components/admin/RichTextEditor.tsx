"use client";

import { useId, useRef, useState } from "react";
import { RichText } from "@/components/ui/RichText";
import { hintClass, inputClass, labelClass } from "@/components/ui/form-styles";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** 指定するとフォーム送信用の hidden input を出力する */
  name?: string;
  rows?: number;
  hint?: string;
  required?: boolean;
};

type Tool = { label: string; title: string; apply: (selected: string) => { text: string; select?: [number, number] } };

const tools: Tool[] = [
  { label: "見出し", title: "見出し（## ）", apply: (s) => ({ text: `\n## ${s || "見出し"}\n` }) },
  { label: "小見出し", title: "小見出し（### ）", apply: (s) => ({ text: `\n### ${s || "小見出し"}\n` }) },
  { label: "B", title: "太字（**文字**）", apply: (s) => ({ text: `**${s || "太字"}**` }) },
  {
    label: "リンク",
    title: "リンク（[文字](URL)）",
    apply: (s) => {
      const text = `[${s || "リンク文字"}](https://)`;
      // URL 部分を選択状態にして、そのまま貼り付けられるようにする
      return { text, select: [text.length - 9, text.length - 1] };
    },
  },
  {
    label: "• 箇条書き",
    title: "箇条書き（- ）",
    apply: (s) => ({ text: (s || "項目").split("\n").map((line) => `- ${line.replace(/^[-・]\s*/, "")}`).join("\n") }),
  },
];

/**
 * 簡易リッチテキストエディタ。
 * 見出し・太字・リンク・箇条書き・改行をボタンで入力でき、プレビューで表示を確認できる。
 * 保存形式は記号ベースのテキスト（HTMLは保存しない）。
 */
export function RichTextEditor({ label, value, onChange, name, rows = 6, hint, required }: Props) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  function applyTool(tool: Tool) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { text, select } = tool.apply(value.slice(start, end));
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const [from, to] = select ?? [text.length, text.length];
      el.setSelectionRange(start + from, start + to);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="ml-1 font-normal text-rose-300/80">必須</span>}
        </label>
        <div className="flex rounded-md text-[11px] ring-1 ring-inset ring-line-strong" role="tablist">
          {(["編集", "プレビュー"] as const).map((tab, i) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={preview === (i === 1)}
              onClick={() => setPreview(i === 1)}
              className={`px-2.5 py-1 ${preview === (i === 1) ? "bg-cyan-400/15 text-cyan-100" : "text-slate-400 hover:text-slate-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {preview ? (
        <div className="mt-1.5 min-h-24 rounded-lg border border-line-strong bg-night-2/60 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
          {value.trim() ? <RichText source={value} /> : <p className="text-slate-600">（未入力）</p>}
        </div>
      ) : (
        <>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                title={tool.title}
                onClick={() => applyTool(tool)}
                className={`rounded border border-line-strong px-2 py-0.5 text-xs text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-100 ${tool.label === "B" ? "font-bold" : ""}`}
              >
                {tool.label}
              </button>
            ))}
          </div>
          <textarea
            id={id}
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            required={required}
            className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
          />
        </>
      )}
      {name && <input type="hidden" name={name} value={value} />}
      <p className={hintClass}>
        {hint ? `${hint} ` : ""}改行はそのまま反映、空行で段落を分けます。
      </p>
    </div>
  );
}
