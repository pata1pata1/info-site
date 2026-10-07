/**
 * 公開サイトの検索語の正規化。
 * - 全角英数字・記号は NFKC で半角にそろえる（「ＡＢＣ」→「ABC」）。英字の大文字小文字は DB 側の ilike で区別しない
 * - 前後の空白を除き、空白（全角含む）で区切った語をすべて含む事案を探す（AND 検索）
 * - LIKE のワイルドカード（% _ *）や PostgREST の構文に関わる文字（" \ , ( )）は取り除く
 */
export const SEARCH_MAX_LENGTH = 50;
export const SEARCH_MAX_TERMS = 5;

export function normalizeSearchQuery(raw: string | string[] | undefined): { query: string; terms: string[] } {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const query = (value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, SEARCH_MAX_LENGTH);
  const terms = query
    .split(" ")
    .map((t) => t.replace(/[%_*"\\,()]/g, ""))
    .filter((t) => t.length > 0)
    .slice(0, SEARCH_MAX_TERMS);
  return { query, terms };
}
