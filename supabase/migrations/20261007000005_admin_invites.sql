-- 管理者の招待・一覧・解除
-- 20261007000002_cms.sql（is_admin）の実行後に、SQL Editor で1回だけ実行する。
--
-- 流れ：管理者が招待を作成（招待リンクを発行）→ 招待された本人が会員登録・メール認証・ログイン
--       → 招待リンクを開いて受け取る → 招待メールアドレスとログイン中のメールアドレスが一致した場合だけ admin_users に登録
-- 招待トークンはサーバーで生成し、DB には SHA-256 ハッシュだけを保存する（トークン自体は保存しない）。

create table public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- 同じメールアドレスへの未使用の招待は1件まで
create unique index admin_invites_one_pending_per_email on public.admin_invites (email) where status = 'pending';

alter table public.admin_invites enable row level security;

-- 参照・作成・取り消しは管理者のみ（削除のポリシーは置かない＝履歴を残す）
create policy "管理者は招待を参照できる" on public.admin_invites
  for select to authenticated using ((select public.is_admin()));
create policy "管理者は自分の名前で招待を作成できる" on public.admin_invites
  for insert to authenticated
  with check ((select public.is_admin()) and invited_by = (select auth.uid()) and status = 'pending');
create policy "管理者は招待を更新できる" on public.admin_invites
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- admin_users：管理者は一覧を参照できる。追加・削除は下の関数経由のみ（直接の insert/delete ポリシーは置かない）
create policy "管理者は管理者一覧を参照できる" on public.admin_users
  for select to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 招待の受け取り（ログイン中の本人が実行）
-- ---------------------------------------------------------------------------
create function public.accept_admin_invite(p_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_confirmed timestamptz;
  v_invite public.admin_invites%rowtype;
begin
  if v_uid is null then
    return 'not_authenticated';
  end if;

  select lower(email), email_confirmed_at into v_email, v_confirmed from auth.users where id = v_uid;
  if v_confirmed is null then
    return 'email_not_confirmed';
  end if;

  select * into v_invite from public.admin_invites
  where token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
  for update;

  if not found then
    return 'invalid';
  end if;
  if v_invite.status = 'accepted' then
    return 'already_used';
  end if;
  if v_invite.status = 'revoked' then
    return 'revoked';
  end if;
  if v_invite.status = 'expired' or v_invite.expires_at <= now() then
    update public.admin_invites set status = 'expired' where id = v_invite.id and status = 'pending';
    return 'expired';
  end if;
  -- 招待されたメールアドレス本人でなければ受け取れない（招待は消費しない）
  if v_invite.email <> v_email then
    return 'email_mismatch';
  end if;

  insert into public.admin_users (user_id) values (v_uid) on conflict (user_id) do nothing;
  update public.admin_invites
    set status = 'accepted', accepted_at = now(), accepted_by = v_uid
    where id = v_invite.id;
  return 'accepted';
end;
$$;

revoke all on function public.accept_admin_invite(text) from public, anon;
grant execute on function public.accept_admin_invite(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 管理者一覧（メールアドレスは auth.users にあるため関数で返す。管理者のみ）
-- ---------------------------------------------------------------------------
create function public.admin_list_admins()
returns table (user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select a.user_id, u.email::text, a.created_at, u.last_sign_in_at
    from public.admin_users a
    join auth.users u on u.id = a.user_id
    order by a.created_at;
end;
$$;

revoke all on function public.admin_list_admins() from public, anon;
grant execute on function public.admin_list_admins() to authenticated;

-- ---------------------------------------------------------------------------
-- 管理者権限の解除（自分自身は解除できない・管理者が0人にならない）
-- ---------------------------------------------------------------------------
create function public.admin_remove_admin(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() then
    return 'cannot_remove_self';
  end if;

  -- 同時に解除して0人になるのを防ぐため、管理者一覧をロックしてから数える
  lock table public.admin_users in share row exclusive mode;
  if not exists (select 1 from public.admin_users where user_id = p_user_id) then
    return 'not_found';
  end if;
  if (select count(*) from public.admin_users) <= 1 then
    return 'last_admin';
  end if;

  delete from public.admin_users where user_id = p_user_id;
  return 'removed';
end;
$$;

revoke all on function public.admin_remove_admin(uuid) from public, anon;
grant execute on function public.admin_remove_admin(uuid) to authenticated;
