-- 会員プロフィールと情報提供コメント
-- Supabase ダッシュボードの SQL Editor で実行するか、`supabase db push` で適用する。

-- ---------------------------------------------------------------------------
-- 会員プロフィール（公開用の表示名）
-- メールアドレスは auth.users にのみ保存し、公開側には一切出さない。
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "本人のみプロフィールを参照" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "本人のみプロフィールを更新" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- 会員登録時にプロフィール行を作成する（登録フォームの表示名を引き継ぐ）
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  name text := nullif(btrim(new.raw_user_meta_data ->> 'display_name'), '');
begin
  insert into public.profiles (id, display_name)
  values (new.id, case when char_length(name) between 1 and 30 then name end);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 管理者（将来の管理画面用）。ポリシーを置かないため、一般ユーザーからは読み書きできない。
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- ---------------------------------------------------------------------------
-- 情報提供コメント
-- status: investigating=調査中 / verified=確認済み / reference=参考情報 / archived=掲載終了 / rejected=却下
-- ---------------------------------------------------------------------------
create type public.comment_status as enum ('investigating', 'verified', 'reference', 'archived', 'rejected');

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('animal-abuse', 'bad-business', 'good-business')),
  case_slug text not null check (case_slug ~ '^[a-z0-9-]{1,100}$'),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 10 and 2000),
  source_url text check (source_url is null or (source_url ~ '^https?://' and char_length(source_url) <= 2048)),
  -- 投稿者が情報を確認した日時（任意）
  info_checked_at timestamptz,
  status public.comment_status not null default 'investigating',
  -- 管理者による非公開化（削除せずに残す）
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_case_idx on public.comments (category, case_slug, created_at desc);
create index comments_user_idx on public.comments (user_id, created_at desc);

alter table public.comments enable row level security;

-- 投稿はログインユーザー本人の名義でのみ可能
create policy "ログインユーザーは本人名義で投稿できる" on public.comments
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- 本人は自分の投稿を参照できる（公開一覧は public_comments ビューを使う）
create policy "本人は自分の投稿を参照できる" on public.comments
  for select to authenticated using ((select auth.uid()) = user_id);

-- 更新・削除のポリシーは置かない（ステータス変更・非公開化は管理者がサービスロールで行う）

-- 新規投稿は必ず「調査中」・公開状態で登録し、短時間の連投を制限する
create function public.enforce_new_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.status := 'investigating';
  new.is_hidden := false;
  new.created_at := now();
  new.updated_at := now();

  if (
    select count(*) from public.comments
    where user_id = new.user_id and created_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'too_many_comments' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger before_comment_insert
  before insert on public.comments
  for each row execute function public.enforce_new_comment();

-- ---------------------------------------------------------------------------
-- 将来の画像添付用（現段階では UI なし。挿入ポリシーも置かない）
-- ---------------------------------------------------------------------------
create table public.comment_attachments (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

alter table public.comment_attachments enable row level security;

-- ---------------------------------------------------------------------------
-- 公開用ビュー：非公開・掲載終了・却下を除外し、user_id とメールアドレスは含めない。
-- 所有者権限で実行される（security_invoker を付けない）ことで、
-- profiles の他人の行を直接読ませずに表示名だけを公開する。
-- ---------------------------------------------------------------------------
create view public.public_comments as
  select
    c.id,
    c.category,
    c.case_slug,
    c.body,
    c.source_url,
    c.info_checked_at,
    c.status,
    c.created_at,
    coalesce(p.display_name, '登録ユーザー') as display_name
  from public.comments c
  left join public.profiles p on p.id = c.user_id
  where not c.is_hidden
    and c.status not in ('archived', 'rejected');

revoke all on public.public_comments from anon, authenticated;
grant select on public.public_comments to anon, authenticated;
