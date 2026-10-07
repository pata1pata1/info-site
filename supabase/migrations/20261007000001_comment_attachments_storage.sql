-- 情報提供コメントの画像添付（Supabase Storage）
-- 20261007000000_members_and_comments.sql の実行後に、SQL Editor で実行する。

-- ---------------------------------------------------------------------------
-- comment_attachments の拡張
-- ---------------------------------------------------------------------------
alter table public.comment_attachments
  -- 将来の動画対応のため、メディアの種類を持たせる（現在は image のみ）
  add column media_type text not null default 'image' check (media_type in ('image')),
  add column file_size integer not null default 0 check (file_size between 1 and 5242880),
  add column sort_order smallint not null default 0 check (sort_order between 0 and 4),
  add column width integer check (width is null or width > 0),
  add column height integer check (height is null or height > 0),
  -- 以下は将来の管理画面用
  add column description text check (description is null or char_length(description) <= 200),
  add column is_hidden boolean not null default false,
  add column removal_reason text,
  add column hidden_at timestamptz;

alter table public.comment_attachments
  alter column file_size drop default,
  add constraint comment_attachments_mime_type_check
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  add constraint comment_attachments_storage_path_check
    check (storage_path ~ '^comments/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  add constraint comment_attachments_storage_path_key unique (storage_path),
  add constraint comment_attachments_comment_order_key unique (comment_id, sort_order);

create index comment_attachments_comment_idx on public.comment_attachments (comment_id, sort_order);

-- 自分の投稿（投稿直後の10分以内）にだけ添付できる
create policy "本人は投稿直後のコメントに添付できる" on public.comment_attachments
  for insert to authenticated
  with check (
    exists (
      select 1 from public.comments c
      where c.id = comment_id
        and c.user_id = (select auth.uid())
        and c.created_at > now() - interval '10 minutes'
    )
  );

-- 新規添付は必ず公開状態で登録し、1コメントあたり5件までに制限する
create function public.enforce_new_attachment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.is_hidden := false;
  new.removal_reason := null;
  new.hidden_at := null;
  new.created_at := now();

  if (select count(*) from public.comment_attachments where comment_id = new.comment_id) >= 5 then
    raise exception 'too_many_attachments' using errcode = 'P0001';
  end if;
  -- 保存パスは comments/{comment_id}/... に限る
  if split_part(new.storage_path, '/', 2) <> new.comment_id::text then
    raise exception 'invalid_storage_path' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger before_attachment_insert
  before insert on public.comment_attachments
  for each row execute function public.enforce_new_attachment();

-- 公開用ビュー：非公開の添付・非公開/掲載終了/却下のコメントの添付を除外する
create view public.public_comment_attachments as
  select a.id, a.comment_id, a.storage_path, a.media_type, a.mime_type, a.width, a.height, a.sort_order, a.description
  from public.comment_attachments a
  join public.comments c on c.id = a.comment_id
  where not a.is_hidden
    and not c.is_hidden
    and c.status not in ('archived', 'rejected');

revoke all on public.public_comment_attachments from anon, authenticated;
grant select on public.public_comment_attachments to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket：情報提供画像専用（非公開。表示は期限付き署名URLで行う）
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comment-evidence', 'comment-evidence', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- アップロード可否：comments/{自分のコメントID}/{uuid}.{拡張子} で、投稿から10分以内・5ファイルまで
create function public.can_upload_comment_evidence(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folder text := split_part(object_name, '/', 2);
begin
  if object_name !~ '^comments/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$' then
    return false;
  end if;

  if not exists (
    select 1 from public.comments c
    where c.id::text = folder
      and c.user_id = auth.uid()
      and c.created_at > now() - interval '10 minutes'
  ) then
    return false;
  end if;

  return (
    select count(*) from storage.objects o
    where o.bucket_id = 'comment-evidence' and split_part(o.name, '/', 2) = folder
  ) < 5;
end;
$$;

-- 閲覧可否：公開中のコメントに紐づく、非公開でない添付だけ
create function public.is_public_comment_evidence(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.comment_attachments a
    join public.comments c on c.id = a.comment_id
    where a.storage_path = object_name
      and not a.is_hidden
      and not c.is_hidden
      and c.status not in ('archived', 'rejected')
  );
$$;

create policy "comment-evidence: 本人が投稿直後のコメントに画像を追加" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'comment-evidence' and public.can_upload_comment_evidence(name));

-- 署名URLの発行に必要な参照権限（公開中の添付のみ）
create policy "comment-evidence: 公開中の添付を参照" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'comment-evidence' and public.is_public_comment_evidence(name));

-- 更新・削除のポリシーは置かない（差し替え・削除は管理者がサービスロールで行う）
