/**
 * 情報提供コメントの入力チェック。
 * 個人宅の詳細住所・電話番号・メールアドレス・脅迫や暴力を促す表現を含む投稿を受け付けない。
 * 機械的な判定には限界があるため、最終的には管理者による確認（調査中ステータス）で担保する。
 */

export const BODY_MIN = 10;
export const BODY_MAX = 2000;

type Rule = { pattern: RegExp; message: string };

// 全角数字・ハイフンは事前に半角へ正規化してから判定する
const rules: Rule[] = [
  {
    pattern: /(?<!\d)(?:\+81[\s-]?|0)\d{1,4}[\s-]?\d{1,4}[\s-]?\d{3,4}(?!\d)/,
    message: "電話番号と思われる記載があります。電話番号は投稿できません。",
  },
  {
    pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/,
    message: "メールアドレスと思われる記載があります。連絡先は投稿できません。",
  },
  {
    pattern: /\d+\s*丁目\s*\d+|\d+\s*番地?\s*\d+\s*号?|\d+\s*号室|(?<!\d)\d{1,3}-\d{1,4}-\d{1,4}(?!\d)/,
    message: "番地・号室など詳細な住所と思われる記載があります。地域は市区町村程度までにしてください。",
  },
  {
    pattern: /殺す|殺せ|殺してやる|死ね|燃やせ|燃やしてやる|襲え|凸しろ|突撃しろ|晒せ|特定しろ|家に行け|痛い目/,
    message: "脅迫や暴力・嫌がらせを促すと受け取られる表現が含まれています。",
  },
];

function normalize(text: string): string {
  return text
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[－ー―‐−]/g, "-")
    .replace(/[＠]/g, "@");
}

/** 本文に投稿できない内容が含まれていればメッセージを返す */
export function findProhibitedContent(text: string): string | null {
  const normalized = normalize(text);
  return rules.find((rule) => rule.pattern.test(normalized))?.message ?? null;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && value.length <= 2048;
  } catch {
    return false;
  }
}

/** ログイン後の戻り先として安全な相対パスかどうか（オープンリダイレクト防止） */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : fallback;
}
