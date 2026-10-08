/*
  事案ごとの管理者専用メモ（「アニマルポリス」欄）
  20261007000002_cms.sql（cases・is_admin・set_updated_at）の実行後に、SQL Editor で実行する。

  公開サイトが読み取る cases テーブルには列を足さず、管理者だけが読める別テーブルに保存する。
  閲覧・作成・更新・削除：管理者のみ（RLS）。anon には権限自体を付与しない。
  1事案につき1件（case_id が一意）。事案を削除すると一緒に削除される。

  再実行しても安全な形にしている（テーブルは既存なら作らず、ポリシー・トリガーは作り直す。データは削除しない）。
  ポリシー名は ASCII のみ（日本語名はコピー時の文字化けで同名になり、重複エラーになることがあるため）。
*/

create table if not exists public.case_admin_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases (id) on delete cascade,
  animal_police_note text not null default '' check (char_length(animal_police_note) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.case_admin_notes enable row level security;

revoke all on public.case_admin_notes from anon;

drop policy if exists case_admin_notes_select_admin on public.case_admin_notes;
create policy case_admin_notes_select_admin on public.case_admin_notes
  for select to authenticated using ((select public.is_admin()));

drop policy if exists case_admin_notes_insert_admin on public.case_admin_notes;
create policy case_admin_notes_insert_admin on public.case_admin_notes
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists case_admin_notes_update_admin on public.case_admin_notes;
create policy case_admin_notes_update_admin on public.case_admin_notes
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists case_admin_notes_delete_admin on public.case_admin_notes;
create policy case_admin_notes_delete_admin on public.case_admin_notes
  for delete to authenticated using ((select public.is_admin()));

drop trigger if exists case_admin_notes_updated_at on public.case_admin_notes;
create trigger case_admin_notes_updated_at before update on public.case_admin_notes
  for each row execute function public.set_updated_at();
