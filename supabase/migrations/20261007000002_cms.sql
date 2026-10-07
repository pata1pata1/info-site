-- 管理者用CMS：ページ文章・案件・お知らせ・案件画像・コメント管理
-- 20261007000000_members_and_comments.sql / 20261007000001_comment_attachments_storage.sql の実行後に実行する。
-- 初期データ（現在サイトに掲載している内容）は 20261007000003_cms_seed.sql で投入する。

-- ---------------------------------------------------------------------------
-- 共通
-- ---------------------------------------------------------------------------

-- 管理者判定。admin_users に登録されたユーザーだけが true（未ログインは常に false）
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 公開状態：下書き / 公開 / 非公開
create type public.publish_status as enum ('draft', 'published', 'private');

-- ---------------------------------------------------------------------------
-- 固定ページの文章（TOP・カテゴリページ）
-- cms_pages は公開中の内容、cms_page_drafts は編集中の下書き（管理者のみ参照可）
-- ---------------------------------------------------------------------------
create table public.cms_pages (
  slug text primary key check (slug in ('home', 'animal-abuse', 'bad-business', 'good-business')),
  content jsonb not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cms_page_drafts (
  slug text primary key check (slug in ('home', 'animal-abuse', 'bad-business', 'good-business')),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger cms_pages_updated_at before update on public.cms_pages
  for each row execute function public.set_updated_at();
create trigger cms_page_drafts_updated_at before update on public.cms_page_drafts
  for each row execute function public.set_updated_at();

alter table public.cms_pages enable row level security;
alter table public.cms_page_drafts enable row level security;

create policy "公開中のページ文章は誰でも参照できる" on public.cms_pages
  for select to anon, authenticated using (true);
create policy "管理者はページ文章を追加できる" on public.cms_pages
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者はページ文章を更新できる" on public.cms_pages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者はページ文章を削除できる" on public.cms_pages
  for delete to authenticated using ((select public.is_admin()));

create policy "管理者のみ下書きを操作できる" on public.cms_page_drafts
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 案件（個別情報ページの正式な本文。ユーザー投稿の comments とは別テーブル）
-- ---------------------------------------------------------------------------
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('animal-abuse', 'bad-business', 'good-business')),
  -- URL の一部。コメントとの紐付けに使うため、作成後は変更しない（管理画面でも固定）
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  title text not null check (char_length(title) between 1 and 200),
  summary text not null default '',
  case_status text not null check (case_status in (
    '報道', '捜査中', '逮捕', '書類送検', '起訴', '不起訴', '有罪判決', '無罪',
    '行政指導', '行政処分', '公的表彰', '公的認定', '第三者認証', 'その他'
  )),
  status_note text,
  person_name text,
  business_name text,
  business_type text,
  region text not null default '',
  animal_type text not null default '',
  occurred_at text,
  reported_on date,
  current_status text not null default '',
  issues text[] not null default '{}',
  administrative_actions text[] not null default '{}',
  legal_progress text[] not null default '{}',
  initiatives text[] not null default '{}',
  listing_reason text,
  -- [{ name, grantor, date, sourceKeys[] }]
  certifications jsonb not null default '[]',
  main_image_path text check (main_image_path is null or main_image_path ~ '^cases/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  main_image_alt text,
  main_image_caption text,
  main_image_source_name text,
  main_image_source_url text check (main_image_source_url is null or main_image_source_url ~ '^https?://'),
  main_image_width integer,
  main_image_height integer,
  publish_status public.publish_status not null default 'draft',
  -- ページに表示する「最終更新日」（管理者が内容を確認・更新した日）
  content_updated_on date not null default current_date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, slug)
);

create index cases_listing_idx on public.cases (category, publish_status, content_updated_on desc);

create trigger cases_updated_at before update on public.cases
  for each row execute function public.set_updated_at();

-- 情報源（1案件に複数）。key は時系列・事実から参照するための案件内の識別子
create table public.case_sources (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  key text not null check (key ~ '^[A-Za-z0-9_-]{1,60}$'),
  publisher text not null check (char_length(publisher) between 1 and 200),
  title text not null check (char_length(title) between 1 and 300),
  published_on date,
  url text not null check (url ~ '^https?://'),
  kind text not null default '報道' check (kind in ('報道', '公的機関')),
  sort_order integer not null default 0,
  unique (case_id, key)
);

create table public.case_timeline_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  -- YYYY / YYYY-MM / YYYY-MM-DD（判明している粒度で記載）
  event_date text not null check (event_date ~ '^\d{4}(-\d{2}(-\d{2})?)?$'),
  date_note text,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  source_keys text[] not null default '{}',
  sort_order integer not null default 0
);

create table public.case_facts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  source_keys text[] not null default '{}',
  sort_order integer not null default 0
);

create index case_sources_case_idx on public.case_sources (case_id, sort_order);
create index case_timeline_case_idx on public.case_timeline_events (case_id, sort_order);
create index case_facts_case_idx on public.case_facts (case_id, sort_order);

alter table public.cases enable row level security;
alter table public.case_sources enable row level security;
alter table public.case_timeline_events enable row level security;
alter table public.case_facts enable row level security;

create policy "公開中の案件は誰でも参照できる（管理者は全件）" on public.cases
  for select to anon, authenticated
  using (publish_status = 'published' or (select public.is_admin()));
create policy "管理者のみ案件を追加できる" on public.cases
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者のみ案件を更新できる" on public.cases
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者のみ案件を削除できる" on public.cases
  for delete to authenticated using ((select public.is_admin()));

-- 子テーブル：親案件が公開中なら参照可。書き込みは管理者のみ
create policy "公開中の案件の情報源を参照" on public.case_sources
  for select to anon, authenticated
  using (exists (select 1 from public.cases c where c.id = case_id and (c.publish_status = 'published' or (select public.is_admin()))));
create policy "管理者のみ情報源を操作" on public.case_sources
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "公開中の案件の時系列を参照" on public.case_timeline_events
  for select to anon, authenticated
  using (exists (select 1 from public.cases c where c.id = case_id and (c.publish_status = 'published' or (select public.is_admin()))));
create policy "管理者のみ時系列を操作" on public.case_timeline_events
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "公開中の案件の事実を参照" on public.case_facts
  for select to anon, authenticated
  using (exists (select 1 from public.cases c where c.id = case_id and (c.publish_status = 'published' or (select public.is_admin()))));
create policy "管理者のみ事実を操作" on public.case_facts
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 案件と子テーブル（情報源・時系列・事実）を1トランザクションで保存する。
-- 呼び出し元の権限（RLS）で実行され、さらに管理者でなければ拒否する。
-- category と slug は新規作成時のみ設定でき、更新時は変更されない。
create function public.admin_save_case(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_case_id uuid := nullif(payload ->> 'id', '')::uuid;
  v_status public.publish_status := (payload ->> 'publish_status')::public.publish_status;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_case_id is null then
    insert into public.cases (category, slug, title, case_status, publish_status)
    values (payload ->> 'category', payload ->> 'slug', payload ->> 'title', payload ->> 'case_status', v_status)
    returning id into v_case_id;
  end if;

  update public.cases set
    title = payload ->> 'title',
    summary = coalesce(payload ->> 'summary', ''),
    case_status = payload ->> 'case_status',
    status_note = nullif(payload ->> 'status_note', ''),
    person_name = nullif(payload ->> 'person_name', ''),
    business_name = nullif(payload ->> 'business_name', ''),
    business_type = nullif(payload ->> 'business_type', ''),
    region = coalesce(payload ->> 'region', ''),
    animal_type = coalesce(payload ->> 'animal_type', ''),
    occurred_at = nullif(payload ->> 'occurred_at', ''),
    reported_on = nullif(payload ->> 'reported_on', '')::date,
    current_status = coalesce(payload ->> 'current_status', ''),
    issues = array(select jsonb_array_elements_text(coalesce(payload -> 'issues', '[]'))),
    administrative_actions = array(select jsonb_array_elements_text(coalesce(payload -> 'administrative_actions', '[]'))),
    legal_progress = array(select jsonb_array_elements_text(coalesce(payload -> 'legal_progress', '[]'))),
    initiatives = array(select jsonb_array_elements_text(coalesce(payload -> 'initiatives', '[]'))),
    listing_reason = nullif(payload ->> 'listing_reason', ''),
    certifications = coalesce(payload -> 'certifications', '[]'),
    publish_status = v_status,
    content_updated_on = coalesce(nullif(payload ->> 'content_updated_on', '')::date, current_date),
    published_at = case when v_status = 'published' then coalesce(published_at, now()) else published_at end
  where id = v_case_id;

  if not found then
    raise exception 'case_not_found' using errcode = 'P0002';
  end if;

  -- 子テーブルは全件入れ替える（配列の順番を sort_order として保存）
  delete from public.case_sources where case_sources.case_id = v_case_id;
  insert into public.case_sources (case_id, key, publisher, title, published_on, url, kind, sort_order)
  select v_case_id, e.item ->> 'key', e.item ->> 'publisher', e.item ->> 'title',
    nullif(e.item ->> 'published_on', '')::date, e.item ->> 'url', coalesce(nullif(e.item ->> 'kind', ''), '報道'),
    (e.ord - 1)::int
  from jsonb_array_elements(coalesce(payload -> 'sources', '[]')) with ordinality as e(item, ord);

  delete from public.case_timeline_events where case_timeline_events.case_id = v_case_id;
  insert into public.case_timeline_events (case_id, event_date, date_note, title, description, source_keys, sort_order)
  select v_case_id, e.item ->> 'event_date', nullif(e.item ->> 'date_note', ''), e.item ->> 'title',
    nullif(e.item ->> 'description', ''),
    array(select jsonb_array_elements_text(coalesce(e.item -> 'source_keys', '[]'))),
    (e.ord - 1)::int
  from jsonb_array_elements(coalesce(payload -> 'timeline', '[]')) with ordinality as e(item, ord);

  delete from public.case_facts where case_facts.case_id = v_case_id;
  insert into public.case_facts (case_id, body, source_keys, sort_order)
  select v_case_id, e.item ->> 'body',
    array(select jsonb_array_elements_text(coalesce(e.item -> 'source_keys', '[]'))),
    (e.ord - 1)::int
  from jsonb_array_elements(coalesce(payload -> 'facts', '[]')) with ordinality as e(item, ord);

  return v_case_id;
end;
$$;

revoke all on function public.admin_save_case(jsonb) from public, anon;
grant execute on function public.admin_save_case(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- お知らせ
-- ---------------------------------------------------------------------------
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '',
  label text not null default 'お知らせ' check (label in ('お知らせ', '更新', 'メンテナンス')),
  published_on date not null default current_date,
  publish_status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_listing_idx on public.news (publish_status, published_on desc);

create trigger news_updated_at before update on public.news
  for each row execute function public.set_updated_at();

alter table public.news enable row level security;

create policy "公開中のお知らせは誰でも参照できる（管理者は全件）" on public.news
  for select to anon, authenticated
  using (publish_status = 'published' or (select public.is_admin()));
create policy "管理者のみお知らせを追加できる" on public.news
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者のみお知らせを更新できる" on public.news
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者のみお知らせを削除できる" on public.news
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 情報提供コメントの管理（管理者による参照・ステータス変更・非公開化・削除）
-- ---------------------------------------------------------------------------
create trigger comments_updated_at before update on public.comments
  for each row execute function public.set_updated_at();

create policy "管理者は全コメントを参照できる" on public.comments
  for select to authenticated using ((select public.is_admin()));
create policy "管理者はコメントを更新できる" on public.comments
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者はコメントを削除できる" on public.comments
  for delete to authenticated using ((select public.is_admin()));

create policy "管理者は全添付を参照できる" on public.comment_attachments
  for select to authenticated using ((select public.is_admin()));
create policy "管理者は添付を更新できる" on public.comment_attachments
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者は添付を削除できる" on public.comment_attachments
  for delete to authenticated using ((select public.is_admin()));

create policy "管理者は投稿者の表示名を参照できる" on public.profiles
  for select to authenticated using ((select public.is_admin()));

create policy "comment-evidence: 管理者は全画像を参照" on storage.objects
  for select to authenticated
  using (bucket_id = 'comment-evidence' and (select public.is_admin()));
create policy "comment-evidence: 管理者は画像を削除" on storage.objects
  for delete to authenticated
  using (bucket_id = 'comment-evidence' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 案件メイン画像の Storage（公開バケット。追加・差し替え・削除は管理者のみ）
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('case-images', 'case-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

create policy "case-images: 管理者のみ追加" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'case-images'
    and (select public.is_admin())
    and name ~ '^cases/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
  );
create policy "case-images: 管理者のみ参照（一覧・削除用）" on storage.objects
  for select to authenticated
  using (bucket_id = 'case-images' and (select public.is_admin()));
create policy "case-images: 管理者のみ更新" on storage.objects
  for update to authenticated
  using (bucket_id = 'case-images' and (select public.is_admin()))
  with check (bucket_id = 'case-images' and (select public.is_admin()));
create policy "case-images: 管理者のみ削除" on storage.objects
  for delete to authenticated
  using (bucket_id = 'case-images' and (select public.is_admin()));
