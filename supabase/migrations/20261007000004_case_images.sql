-- 案件画像の複数枚対応
-- 20261007000002_cms.sql（と 20261007000003_cms_seed.sql）の実行後に、SQL Editor で1回だけ実行する。
--
-- これまでの cases.main_image_*（1枚）を case_images（複数枚）に移す。
-- 既存の画像データは削除しない：cases.main_image_* の列と Storage のファイルはそのまま残し、
-- 同じファイルを参照する行を case_images に作成する。以後アプリは case_images だけを使う。

create table public.case_images (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  storage_path text not null unique
    check (storage_path ~ '^cases/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  alt text not null default '' check (char_length(alt) <= 300),
  caption text check (caption is null or char_length(caption) <= 300),
  source_name text check (source_name is null or char_length(source_name) <= 300),
  source_url text check (source_url is null or source_url ~ '^https?://'),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index case_images_case_idx on public.case_images (case_id, sort_order);

create trigger case_images_updated_at before update on public.case_images
  for each row execute function public.set_updated_at();

-- 1案件あたりの上限（10枚程度の運用を想定し、余裕をもって20枚）
create function public.enforce_case_image_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.case_images where case_id = new.case_id) >= 20 then
    raise exception 'too_many_case_images' using errcode = 'P0001';
  end if;
  -- 保存パスは cases/{case_id}/... に限る
  if split_part(new.storage_path, '/', 2) <> new.case_id::text then
    raise exception 'invalid_storage_path' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger before_case_image_insert
  before insert on public.case_images
  for each row execute function public.enforce_case_image_limit();

alter table public.case_images enable row level security;

create policy "公開中の案件の画像は誰でも参照できる（管理者は全件）" on public.case_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.cases c
    where c.id = case_id and (c.publish_status = 'published' or (select public.is_admin()))
  ));
create policy "管理者のみ案件画像を追加できる" on public.case_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "管理者のみ案件画像を更新できる" on public.case_images
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "管理者のみ案件画像を削除できる" on public.case_images
  for delete to authenticated using ((select public.is_admin()));

-- 既存のメイン画像（1枚）を case_images の1枚目として移行する
insert into public.case_images (case_id, storage_path, alt, caption, source_name, source_url, width, height, sort_order)
select id, main_image_path, coalesce(main_image_alt, ''), main_image_caption, main_image_source_name,
  main_image_source_url, main_image_width, main_image_height, 0
from public.cases
where main_image_path is not null
on conflict (storage_path) do nothing;

comment on column public.cases.main_image_path is
  '旧：メイン画像（1枚）。case_images へ移行済み。アプリからは使用しない（データ保全のため残している）';
