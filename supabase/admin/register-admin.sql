-- 管理者の登録（マイグレーションではありません。必要なときに SQL Editor で実行してください）
--
-- 1. 管理者にする人が、サイトの /signup で会員登録し、確認メールのリンクを開いて登録を完了する
-- 2. 下の your-admin@example.com を、そのメールアドレスに書き換えて実行する
-- 3. 一度ログアウトしてからログインし直し、/admin を開く

insert into public.admin_users (user_id)
select id from auth.users where email = 'your-admin@example.com'
on conflict (user_id) do nothing;

-- 登録されている管理者の確認
select u.email, a.created_at from public.admin_users a join auth.users u on u.id = a.user_id;

-- 管理者から外す場合
-- delete from public.admin_users where user_id = (select id from auth.users where email = 'your-admin@example.com');
