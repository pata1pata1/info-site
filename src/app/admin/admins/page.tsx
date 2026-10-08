import type { Metadata } from "next";
import { AdminInviteForm } from "@/components/admin/AdminInviteForm";
import { AdminNicknameForm, RemoveAdminButton, RevokeInviteButton } from "@/components/admin/AdminUserButtons";
import { Fieldset } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin/auth";
import { adminDisplayName } from "@/lib/admin/display-name";
import { inviteDisplayStatus, type InviteStatus } from "@/lib/admin/invites";

export const metadata: Metadata = { title: "管理者追加" };

const dateTime = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium", timeStyle: "short" });
const fmt = (value: string | null) => (value ? dateTime.format(new Date(value)) : "—");

type AdminRow = { user_id: string; email: string; created_at: string; last_sign_in_at: string | null };
type InviteRow = {
  id: string;
  email: string;
  status: InviteStatus;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

const inviteStatus: Record<InviteRow["status"], { label: string; className: string }> = {
  pending: { label: "未使用", className: "bg-amber-400/10 text-amber-200 ring-amber-300/30" },
  accepted: { label: "受け取り済み", className: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/30" },
  expired: { label: "期限切れ", className: "bg-slate-400/10 text-slate-300 ring-slate-400/25" },
  revoked: { label: "取り消し済み", className: "bg-slate-400/10 text-slate-400 ring-slate-400/25" },
};

/** 管理者一覧・招待（管理者のみ。一覧の取得も DB 側で管理者か確認している） */
export default async function AdminAdminsPage() {
  const { supabase, userId } = await requireAdminPage("/admin/admins");

  const [{ data: adminData, error: adminError }, { data: inviteData, error: inviteError }] = await Promise.all([
    supabase.rpc("admin_list_admins"),
    supabase
      .from("admin_invites")
      .select("id, email, status, invited_by, expires_at, accepted_at, revoked_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const admins = (adminData ?? []) as AdminRow[];
  const invites = (inviteData ?? []) as InviteRow[];
  const emailById = new Map(admins.map((a) => [a.user_id, a.email]));
  // ニックネームはマイページの表示名（profiles.display_name）と同じ項目
  const { data: profiles } = admins.length
    ? await supabase.from("profiles").select("id, display_name").in("id", admins.map((a) => a.user_id))
    : { data: [] };
  const nicknameById = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string | null]));

  const loadError = adminError ?? inviteError;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-50">管理者追加</h1>
      {loadError && (
        <p className="rounded-lg bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100 ring-1 ring-inset ring-amber-300/25">
          読み込みに失敗しました。Supabase で <code className="font-mono">20261007000005_admin_invites.sql</code> を実行済みか確認してください。（{loadError.message}）
        </p>
      )}

      <Fieldset legend={`管理者一覧（${admins.length}人）`} description="自分自身の権限は解除できません。また、管理者が0人になる解除はできません。ニックネームは各自が自分の分を設定します（管理者メモの投稿者名・マイページの表示名と共通）。">
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {admins.map((admin) => {
            const self = admin.user_id === userId;
            const nickname = nicknameById.get(admin.user_id) ?? null;
            const name = adminDisplayName(nickname, admin.email);
            return (
              <li key={admin.user_id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-slate-50">
                    {name.primary}
                    {self && <span className="ml-2 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[11px] font-normal text-cyan-200 ring-1 ring-inset ring-cyan-300/25">あなた</span>}
                  </p>
                  {name.secondary && <p className="truncate text-xs text-slate-400">{name.secondary}</p>}
                  <p className="mt-0.5 text-xs text-slate-500">
                    登録：{fmt(admin.created_at)} ／ 最終ログイン：{fmt(admin.last_sign_in_at)}
                  </p>
                  {self && (
                    <div className="mt-2">
                      <AdminNicknameForm current={nickname} />
                    </div>
                  )}
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-200 ring-1 ring-inset ring-emerald-300/30">有効</span>
                {!self && admins.length > 1 && <RemoveAdminButton userId={admin.user_id} email={admin.email} />}
              </li>
            );
          })}
        </ul>
      </Fieldset>

      <AdminInviteForm />

      <Fieldset legend="招待の履歴" description="未使用の招待は取り消せます。招待リンクは発行時の画面でのみ表示されるため、ここでは再表示できません。">
        {invites.length === 0 ? (
          <p className="text-xs text-slate-500">招待はまだありません。</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {invites.map((invite) => {
              const status = inviteDisplayStatus(invite);
              const badge = inviteStatus[status];
              return (
                <li key={invite.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${badge.className}`}>{badge.label}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-100">{invite.email}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      発行：{fmt(invite.created_at)}（{invite.invited_by ? emailById.get(invite.invited_by) ?? "元管理者" : "—"}）
                      {status === "pending" && ` ／ 有効期限：${fmt(invite.expires_at)}`}
                      {status === "expired" && ` ／ 期限：${fmt(invite.expires_at)}`}
                      {invite.accepted_at && ` ／ 受け取り：${fmt(invite.accepted_at)}`}
                      {invite.revoked_at && ` ／ 取り消し：${fmt(invite.revoked_at)}`}
                    </p>
                  </div>
                  {status === "pending" && <RevokeInviteButton id={invite.id} />}
                </li>
              );
            })}
          </ul>
        )}
      </Fieldset>
    </div>
  );
}
