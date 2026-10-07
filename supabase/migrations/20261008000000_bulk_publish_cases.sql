-- 案件の一括公開（管理画面「選択した案件を公開」用）
--
-- 選択された下書きを1回の関数呼び出し（＝1トランザクション）で公開する。
-- 次のいずれかに当てはまる場合は例外を出し、1件も公開しない（途中まで公開された状態にならない）。
--   ・呼び出したユーザーが管理者でない
--   ・選択が空、または上限（200件）を超える
--   ・選択された案件のうち、存在しない・下書きでない案件が1件でもある（公開済みの案件は更新しない）
--   ・必須項目（タイトル・slug・本文・http(s) の URL を持つ情報源1件以上）が欠けた案件が1件でもある
-- 公開時は publish_status = 'published'、published_at = 現在時刻 にする（updated_at はトリガーで更新される）。
-- 本文・情報源・画像などその他の列・テーブルは変更しない。

create function public.admin_publish_cases(case_ids uuid[])
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_ids uuid[];
  v_requested integer;
  v_drafts integer;
  v_invalid integer;
  v_updated integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select coalesce(array_agg(distinct id), '{}') into v_ids from unnest(case_ids) as t(id) where id is not null;
  v_requested := cardinality(v_ids);
  if v_requested = 0 then
    raise exception 'empty_selection' using errcode = '22023';
  end if;
  if v_requested > 200 then
    raise exception 'too_many_cases' using errcode = '22023';
  end if;

  -- 対象行をロックしてから状態を確認する（確認と更新の間に他の操作で状態が変わらないようにする）
  perform 1 from public.cases where id = any(v_ids) for update;

  select count(*) into v_drafts from public.cases where id = any(v_ids) and publish_status = 'draft';
  if v_drafts <> v_requested then
    raise exception 'not_all_drafts: % of % selected cases are drafts', v_drafts, v_requested using errcode = 'P0001';
  end if;

  select count(*) into v_invalid
  from public.cases c
  where c.id = any(v_ids)
    and (
      btrim(c.title) = ''
      or btrim(c.slug) = ''
      or btrim(c.summary) = ''
      or not exists (select 1 from public.case_sources s where s.case_id = c.id)
      or exists (select 1 from public.case_sources s where s.case_id = c.id and s.url !~ '^https?://\S+$')
    );
  if v_invalid > 0 then
    raise exception 'required_fields_missing: % cases', v_invalid using errcode = 'P0001';
  end if;

  update public.cases
  set publish_status = 'published',
      published_at = now()
  where id = any(v_ids) and publish_status = 'draft';
  get diagnostics v_updated = row_count;

  if v_updated <> v_requested then
    raise exception 'update_count_mismatch: % of %', v_updated, v_requested using errcode = 'P0001';
  end if;

  return v_updated;
end;
$$;

revoke all on function public.admin_publish_cases(uuid[]) from public, anon;
grant execute on function public.admin_publish_cases(uuid[]) to authenticated;
