/**
 * 簡易リッチテキスト（Markdown のごく一部）。
 *
 *   ## 見出し / ### 小見出し
 *   **太字**
 *   [リンクテキスト](https://example.com)
 *   - 箇条書き
 *   改行はそのまま改行、空行で段落を分ける
 *
 * HTML は一切解釈しない（文字列として表示する）ため、管理画面からの入力でスクリプトが混入しない。
 * リンク先は http(s):// と サイト内パス（/ で始まる）のみ許可する。
 */

export type Inline =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; href: string };

export type Block =
  | { type: "heading"; level: 2 | 3; content: Inline[] }
  | { type: "list"; items: Inline[][] }
  | { type: "paragraph"; lines: Inline[][] };

// リンクURLは1段階までの括弧を含められる（例：https://ja.wikipedia.org/wiki/X_(Y)）
const INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

export function safeHref(href: string): string | null {
  if (/^https?:\/\/[^\s]+$/i.test(href)) return href;
  if (/^\/(?!\/)[^\s]*$/.test(href)) return href;
  return null;
}

export function parseInline(text: string): Inline[] {
  const result: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    if (match.index > last) result.push({ type: "text", text: text.slice(last, match.index) });
    if (match[1] !== undefined) {
      result.push({ type: "bold", text: match[1] });
    } else {
      const href = safeHref(match[3]);
      result.push(href ? { type: "link", text: match[2], href } : { type: "text", text: match[2] });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) result.push({ type: "text", text: text.slice(last) });
  return result;
}

export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: Inline[][] | null = null;
  let list: Inline[][] | null = null;

  const flush = () => {
    if (paragraph) blocks.push({ type: "paragraph", lines: paragraph });
    if (list) blocks.push({ type: "list", items: list });
    paragraph = null;
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    const item = /^\s*[-・*]\s+(.+)$/.exec(line);

    if (line.trim() === "") {
      flush();
    } else if (heading) {
      flush();
      blocks.push({ type: "heading", level: heading[1].length as 2 | 3, content: parseInline(heading[2]) });
    } else if (item) {
      if (paragraph) flush();
      (list ??= []).push(parseInline(item[1]));
    } else {
      if (list) flush();
      (paragraph ??= []).push(parseInline(line.trim()));
    }
  }
  flush();
  return blocks;
}

/** 一覧カードや meta description 用に記法を取り除いたテキストにする */
export function toPlainText(source: string): string {
  return parseRichText(source)
    .flatMap((block) => {
      const lines = block.type === "heading" ? [block.content] : block.type === "list" ? block.items : block.lines;
      return lines.map((inlines) => inlines.map((i) => i.text).join(""));
    })
    .join(" ")
    .trim();
}
