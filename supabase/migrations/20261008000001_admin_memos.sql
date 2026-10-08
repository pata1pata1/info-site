/*
  管理者メモ（管理者同士の申し送り・作業メモ）
  20261007000002_cms.sql（is_admin・set_updated_at）の実行後に、SQL Editor で1回だけ実行する。

  閲覧・投稿：管理者のみ
  編集・削除：投稿した本人（かつ現在も管理者）のみ
  一般会員・未ログインユーザーは参照できない（RLS で拒否。anon には権限自体を付与しない）
*/

create table public.admin_memos (
  id uuid primary key default gen_random_uuid(),
  /* 投稿者（Supabase Auth のユーザー）。アカウント削除後もメモは残し、投稿者は「元管理者」と表示する */
  author_user_id uuid references auth.users (id) on delete set null default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index admin_memos_created_idx on public.admin_memos (created_at desc);

alter table public.admin_memos enable row level security;

revoke all on public.admin_memos from anon;

create policy "管理者はメモを参照できる" on public.admin_memos
  for select to authenticated using ((select public.is_admin()));
create policy "管理者は自分の名前でメモを投稿できる" on public.admin_memos
  for insert to authenticated
  with check ((select public.is_admin()) and author_user_id = (select auth.uid()));
create policy "管理者は自分のメモを編集できる" on public.admin_memos
  for update to authenticated
  using ((select public.is_admin()) and author_user_id = (select auth.uid()))
  with check ((select public.is_admin()) and author_user_id = (select auth.uid()));
create policy "管理者は自分のメモを削除できる" on public.admin_memos
  for delete to authenticated
  using ((select public.is_admin()) and author_user_id = (select auth.uid()));

/* 投稿者・作成日時はクライアントから指定・変更させない（投稿時は本人・現在時刻で固定し、編集時は元の値を保つ） */
create function public.enforce_admin_memo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.author_user_id := auth.uid();
    new.created_at := now();
  else
    new.author_user_id := old.author_user_id;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger before_admin_memo_write
  before insert or update on public.admin_memos
  for each row execute function public.enforce_admin_memo();

/*
  ---------------------------------------------------------------------------
  メモ一覧（投稿者のメールアドレス付き・新しい順）。管理者以外は例外にする
  メールアドレスは auth.users にあるため、所有者権限で実行する関数経由で返す
  ---------------------------------------------------------------------------
*/
create function public.admin_list_memos(p_limit integer default 100)
returns table (id uuid, author_user_id uuid, author_email text, body text, created_at timestamptz, updated_at timestamptz)
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
    select m.id, m.author_user_id, u.email::text, m.body, m.created_at, m.updated_at
    from public.admin_memos m
    left join auth.users u on u.id = m.author_user_id
    order by m.created_at desc
    limit least(greatest(coalesce(p_limit, 100), 1), 500);
end;
$$;

revoke all on function public.admin_list_memos(integer) from public, anon;
grant execute on function public.admin_list_memos(integer) to authenticated;
