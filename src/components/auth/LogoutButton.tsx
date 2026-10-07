"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className, redirectTo }: { className?: string; redirectTo?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await createClient()?.auth.signOut();
    if (redirectTo) router.push(redirectTo);
    router.refresh();
    setPending(false);
  }

  return (
    <button type="button" onClick={handleClick} disabled={pending} className={className}>
      {pending ? "ログアウト中…" : "ログアウト"}
    </button>
  );
}
