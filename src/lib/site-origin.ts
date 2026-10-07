import { headers } from "next/headers";

/** メールのリンクや招待リンクに使うサイトのURL（NEXT_PUBLIC_SITE_URL、未設定ならリクエストの Origin） */
export async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}
