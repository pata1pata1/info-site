import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

/**
 * 公開ページ用の読み取り専用クライアント（Cookie を使わない＝匿名ユーザーとして読む）。
 * RLS により公開中のデータしか読めない。Cookie を参照しないためページを静的に生成・キャッシュでき、
 * 管理画面での保存時に revalidatePath で更新する。
 */
export function createPublicClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
