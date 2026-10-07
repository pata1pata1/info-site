/** YYYY-MM-DD / YYYY-MM / YYYY を YYYY.MM.DD 形式で表示する */
export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

/** YYYY-MM-DD / YYYY-MM / YYYY を「2017年8月27日」形式で表示する */
export function formatDateJa(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}年` + (m ? `${Number(m)}月` : "") + (d ? `${Number(d)}日` : "");
}
