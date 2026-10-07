/** フォーム送信結果のメッセージ */
export function FormMessage({ ok, message }: { ok: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${
        ok ? "bg-cyan-400/[0.06] text-cyan-100 ring-cyan-300/25" : "bg-rose-400/[0.06] text-rose-200 ring-rose-300/25"
      }`}
    >
      {message}
    </p>
  );
}
