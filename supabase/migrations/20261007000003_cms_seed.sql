-- CMS の初期データ（2026-10-07 時点でサイトに掲載していた内容）
-- 20261007000002_cms.sql の実行後に、SQL Editor で1回だけ実行する。
-- このファイルは src/lib/cases/seed/*.ts・src/lib/cms/defaults.ts・src/lib/cms/seed-news.ts から生成した。

begin;

-- ページ文章（公開中の内容と、編集用の下書きを同じ内容で作成）
insert into public.cms_pages (slug, content) values ('home', '{"siteName":"スキャムオブザーブ","tagline":"動物が生きやすい社会へ","description":"スキャムオブザーブは、動物に危害を加える動物虐待者に関する情報や、動物関連事業者（ペットショップ・ブリーダー・保護団体など）の評判・実態に関する情報を掲載する情報サイトです。","categoriesTitle":"カテゴリから探す","categoriesDescription":"","recentTitle":"最近追加された情報","recentDescription":"各カテゴリに新しく掲載された情報です。","newsTitle":"お知らせ","newsDescription":"サイトからのお知らせ・更新情報です。","footerNote":"掲載情報は報道・公的機関の発表・寄せられた情報などをもとに整理したものです。個別情報ページには、各ページ下部に記載した情報源で確認できた内容のみを掲載しています。"}'::jsonb);
insert into public.cms_page_drafts (slug, content) values ('home', '{"siteName":"スキャムオブザーブ","tagline":"動物が生きやすい社会へ","description":"スキャムオブザーブは、動物に危害を加える動物虐待者に関する情報や、動物関連事業者（ペットショップ・ブリーダー・保護団体など）の評判・実態に関する情報を掲載する情報サイトです。","categoriesTitle":"カテゴリから探す","categoriesDescription":"","recentTitle":"最近追加された情報","recentDescription":"各カテゴリに新しく掲載された情報です。","newsTitle":"お知らせ","newsDescription":"サイトからのお知らせ・更新情報です。","footerNote":"掲載情報は報道・公的機関の発表・寄せられた情報などをもとに整理したものです。個別情報ページには、各ページ下部に記載した情報源で確認できた内容のみを掲載しています。"}'::jsonb);
insert into public.cms_pages (slug, content) values ('animal-abuse', '{"title":"動物虐待者情報","description":"動物虐待に関する事案や、報道・公的機関の発表などをもとにした情報を掲載します。","supplement":"","policy":"本カテゴリは報道機関・公的機関が公表した情報のみをもとに掲載しています。「逮捕」「書類送検」「起訴」は捜査・裁判の段階を示すもので、有罪が確定したことを意味しません。判決についても、確定の有無は情報源に記載がある場合のみ記載しています。"}'::jsonb);
insert into public.cms_page_drafts (slug, content) values ('animal-abuse', '{"title":"動物虐待者情報","description":"動物虐待に関する事案や、報道・公的機関の発表などをもとにした情報を掲載します。","supplement":"","policy":"本カテゴリは報道機関・公的機関が公表した情報のみをもとに掲載しています。「逮捕」「書類送検」「起訴」は捜査・裁判の段階を示すもので、有罪が確定したことを意味しません。判決についても、確定の有無は情報源に記載がある場合のみ記載しています。"}'::jsonb);
insert into public.cms_pages (slug, content) values ('bad-business', '{"title":"悪徳動物関連事業者","description":"ペットショップ・ブリーダー等、不適切な飼養や取引が指摘されている事業者の情報を掲載します。","supplement":"","policy":"本カテゴリは行政処分・公的発表・裁判・信頼できる報道など、客観的根拠が確認できる案件のみを掲載しています。口コミや評判のみを根拠とした掲載は行いません。逮捕・起訴は有罪が確定したことを意味しません。"}'::jsonb);
insert into public.cms_page_drafts (slug, content) values ('bad-business', '{"title":"悪徳動物関連事業者","description":"ペットショップ・ブリーダー等、不適切な飼養や取引が指摘されている事業者の情報を掲載します。","supplement":"","policy":"本カテゴリは行政処分・公的発表・裁判・信頼できる報道など、客観的根拠が確認できる案件のみを掲載しています。口コミや評判のみを根拠とした掲載は行いません。逮捕・起訴は有罪が確定したことを意味しません。"}'::jsonb);
insert into public.cms_pages (slug, content) values ('good-business', '{"title":"優良動物関連事業者","description":"適切な飼養環境や誠実な対応で評価されている動物関連事業者の情報を掲載します。","supplement":"","policy":"本カテゴリは自治体・公的機関による認定や表彰、第三者機関の認証、信頼できる報道など、掲載理由が確認できる事業者・団体のみを掲載しています。当サイト独自の推薦ではありません。"}'::jsonb);
insert into public.cms_page_drafts (slug, content) values ('good-business', '{"title":"優良動物関連事業者","description":"適切な飼養環境や誠実な対応で評価されている動物関連事業者の情報を掲載します。","supplement":"","policy":"本カテゴリは自治体・公的機関による認定や表彰、第三者機関の認証、信頼できる報道など、掲載理由が確認できる事業者・団体のみを掲載しています。当サイト独自の推薦ではありません。"}'::jsonb);

-- お知らせ
insert into public.news (title, body, label, published_on, publish_status) values ('報道・公的機関の発表に基づく個別情報ページを公開しました', '', '更新', '2026-10-07', 'published');
insert into public.news (title, body, label, published_on, publish_status) values ('サイトを公開しました（テスト版）', '', 'お知らせ', '2026-10-06', 'published');
insert into public.news (title, body, label, published_on, publish_status) values ('掲載基準・ご利用にあたっての注意事項を準備中です', '', '更新', '2026-10-01', 'published');
insert into public.news (title, body, label, published_on, publish_status) values ('カテゴリ「優良動物関連事業者」を追加しました', '', '更新', '2026-09-20', 'published');
insert into public.news (title, body, label, published_on, publish_status) values ('【サンプル】メンテナンスのお知らせ', '', 'メンテナンス', '2026-09-10', 'published');

-- 案件（情報源・時系列・事実を含む）

-- animal-abuse/saitama-cat-abuse-video-2017
with c as (
  insert into public.cases (category, slug, title, summary, case_status, status_note, person_name, business_name, business_type, region, animal_type, occurred_at, reported_on, current_status, issues, administrative_actions, legal_progress, initiatives, listing_reason, certifications, publish_status, content_updated_on, published_at)
  values ('animal-abuse', 'saitama-cat-abuse-video-2017', '猫13匹の虐待・殺傷を動画撮影し投稿した事件', '2016年3月〜2017年4月、埼玉県内で猫13匹に熱湯をかける、ガスバーナーであぶるなどして9匹を殺し4匹に重傷を負わせ、その様子を動画で投稿したとして、元税理士の男性が動物愛護法違反の罪に問われた事件。2017年12月、東京地裁で懲役1年10月・執行猶予4年の判決が言い渡されたと報じられています。', '有罪判決', '2017年12月12日の東京地裁判決。控訴の有無・判決確定については、本ページで確認した情報源には記載がありません。', '大矢誠（報道時52歳・元税理士）', null, null, '埼玉県', '猫', '2016年3月〜2017年4月', '2017-10-03', '2017年12月12日、東京地裁で懲役1年10月・執行猶予4年の有罪判決が言い渡されたと報じられています。控訴の有無や判決の確定、その後の状況については、本ページで確認した情報源には記載がありません。', '{}'::text[], '{}'::text[], array['2017年8月27日：警視庁保安課が動物愛護法違反の疑いで逮捕', '東京地検が起訴（起訴日は情報源に記載なし）', '2017年11月28日：東京地裁で初公判。被告は起訴内容を認めた', '2017年12月12日：東京地裁が懲役1年10月・執行猶予4年の判決']::text[], '{}'::text[], null, '[]'::jsonb, 'published', '2026-10-07', now())
  returning id
),
s as (
  insert into public.case_sources (case_id, key, publisher, title, published_on, url, kind, sort_order)
  select c.id, v.* from c, (values
    ('jprime-10739', '週刊女性PRIME', '＜埼玉・深谷市＞猫虐待殺傷の一部始終を動画撮影した、鬼畜男の正体', '2017-10-03'::date, 'https://www.jprime.jp/articles/-/10739', '報道', 0),
    ('toyokeizai-192795', '東洋経済オンライン（週刊女性PRIME編集部）', '猫を殺傷し動画公開した､ある税理士の実像 ガスバーナーで焼かれ黒焦げに…', '2017-10-14'::date, 'https://toyokeizai.net/articles/-/192795', '報道', 1),
    ('jprime-11219', '週刊女性PRIME', '＜猫虐待殺傷事件初公判＞駆除が一転、猫への復讐と残虐殺害動画が目的に', '2017-12-05'::date, 'https://www.jprime.jp/articles/-/11219', '報道', 2),
    ('tospo-13634', '東スポWEB', '【猫惨殺裁判】杉本彩　執行猶予判決に怒る「法律で裁かれなくても見合った罰は下るはず」', '2017-12-13'::date, 'https://www.tokyo-sports.co.jp/articles/-/13634', '報道', 3)
  ) as v(key, publisher, title, published_on, url, kind, sort_order)
),
t as (
  insert into public.case_timeline_events (case_id, event_date, date_note, title, description, source_keys, sort_order)
  select c.id, v.* from c, (values
    ('2016-03', '〜2017年4月', '猫13匹への虐待', '猫13匹に熱湯をかけたり、ガスバーナーであぶるなどして虐待し、9匹を殺し、4匹に重傷を負わせたとされる。虐待の様子は動画撮影され、インターネット上に投稿されていたと報じられている。', array['jprime-10739', 'jprime-11219', 'tospo-13634']::text[], 0),
    ('2017-08-27', null, '警視庁保安課が逮捕', '動物愛護法違反の疑いで逮捕。その後、東京地検が起訴したと報じられている（起訴日は情報源に記載なし）。', array['jprime-10739']::text[], 1),
    ('2017-11-28', null, '東京地裁で初公判', '被告は起訴内容を認めたと報じられている。', array['jprime-11219']::text[], 2),
    ('2017-12-12', null, '東京地裁が判決', '懲役1年10月、執行猶予4年の判決が言い渡されたと報じられている。', array['tospo-13634']::text[], 3)
  ) as v(event_date, date_note, title, description, source_keys, sort_order)
)
insert into public.case_facts (case_id, body, source_keys, sort_order)
select c.id, v.* from c, (values
  ('被告は元税理士の大矢誠氏（報道時52歳）。罪名は動物愛護法違反。', array['jprime-11219', 'tospo-13634']::text[], 0),
  ('対象は猫13匹で、うち9匹が死亡、4匹が重傷を負ったとされる。', array['jprime-11219', 'tospo-13634']::text[], 1),
  ('犯行期間は2016年3月から2017年4月とされる。', array['jprime-11219', 'tospo-13634']::text[], 2),
  ('虐待の様子を撮影した動画がインターネット上に投稿されていたと報じられている。', array['jprime-10739', 'jprime-11219']::text[], 3)
) as v(body, source_keys, sort_order);

-- bad-business/matsumoto-dog-breeder-2021
with c as (
  insert into public.cases (category, slug, title, summary, case_status, status_note, person_name, business_name, business_type, region, animal_type, occurred_at, reported_on, current_status, issues, administrative_actions, legal_progress, initiatives, listing_reason, certifications, publish_status, content_updated_on, published_at)
  values ('bad-business', 'matsumoto-dog-breeder-2021', '松本市の犬繁殖業者による多頭飼育・虐待事件', '長野県松本市の犬の繁殖場「アニマル桃太郎」で、約1000頭の犬が劣悪な環境で飼育されていたとして、2021年11月に社長ら2人が動物愛護法違反（虐待）の疑いで逮捕された事件。2024年5月、長野地裁松本支部が会社役員の男性に懲役1年・執行猶予3年、罰金10万円の判決を言い渡したと報じられています。', '有罪判決', '2024年5月10日、長野地裁松本支部が会社役員の男性に言い渡した一審判決。控訴の有無・判決確定については、本ページで確認した情報源には記載がありません。逮捕されたもう1人（社員）の処分は情報源に記載がありません。', null, 'アニマル桃太郎', '繁殖業者（ブリーダー）', '長野県松本市', '犬', null, null, '2024年5月10日、長野地裁松本支部で会社役員の男性に有罪判決（懲役1年・執行猶予3年、罰金10万円）が言い渡されたと報じられています。控訴の有無・判決確定、事業の現状、動物取扱業の登録に関する行政処分については、本ページで確認した情報源には記載がありません。', array['2カ所の犬舎で飼育していた450匹以上の犬を、不衛生な環境の中で衰弱させたとされる。', '獣医師免許がないにもかかわらず、妊娠した犬5匹に麻酔なしで帝王切開を行ったとされる。', '犬8匹に狂犬病の予防接種を受けさせなかったとされる。']::text[], '{}'::text[], array['2021年9月上旬：警察が施設を捜索', '2021年11月4日：長野県警が社長（当時60歳）と社員（当時48歳）を動物愛護法違反（虐待）の疑いで逮捕', '2022年3月：長野地裁松本支部で初公判', '検察側が動物愛護法違反の罪で懲役1年、狂犬病予防法違反の罪で罰金10万円を求刑（2024年2月13日付報道）', '2024年5月10日：長野地裁松本支部が会社役員・百瀬耕二被告（判決時63歳）に懲役1年・執行猶予3年、罰金10万円の判決']::text[], '{}'::text[], null, '[]'::jsonb, 'published', '2026-10-07', now())
  returning id
),
s as (
  insert into public.case_sources (case_id, key, publisher, title, published_on, url, kind, sort_order)
  select c.id, v.* from c, (values
    ('shinmai-20211104', '信濃毎日新聞デジタル', '劣悪環境飼育　松本署が前代表ら２人逮捕へ　犬４００匹虐待疑い', '2021-11-04'::date, 'https://www.shinmai.co.jp/news/article/CNTS2021110300595', '報道', 0),
    ('bunshun-49891', '文春オンライン', '「帝王切開は無麻酔」「腸が出たままになった犬も…」逮捕された"悪質ブリーダー"が飼育していた1000頭の犬たちの悲哀《スタッフはわずか数名》', '2021-11-08'::date, 'https://bunshun.jp/articles/-/49891', '報道', 1),
    ('frau-124198', 'FRaU（講談社）', '「懲役１年、罰金10万円」1000頭もの犬の虐待の求刑。杉本彩が見た「犬はモノ」の現実', '2024-02-13'::date, 'https://gendai.media/articles/-/124198', '報道', 2),
    ('daily-20240512', 'デイリースポーツ online', '犬４５０匹以上虐待の繁殖業者に有罪判決、獣医師免許なしで手術も　元刑事「より厳しい対応を」', '2024-05-12'::date, 'https://www.daily.co.jp/gossip/2024/05/12/0017644220.shtml', '報道', 3),
    ('president-86294', 'PRESIDENT Online', '金儲けのために子犬･子猫を大量に生み出す…｢悪徳繁殖業者｣が日本各地で野放しにされている根本原因', '2024-10-01'::date, 'https://president.jp/articles/-/86294', '報道', 4)
  ) as v(key, publisher, title, published_on, url, kind, sort_order)
),
t as (
  insert into public.case_timeline_events (case_id, event_date, date_note, title, description, source_keys, sort_order)
  select c.id, v.* from c, (values
    ('2021-09', '上旬', '施設の捜索', '警察が施設を捜索したと報じられている。この家宅捜索時が、松本市保健所による初めての立ち入り検査だったとも報じられている。', array['shinmai-20211104', 'president-86294']::text[], 0),
    ('2021-11-04', null, '社長ら2人を逮捕', '長野県警が「アニマル桃太郎」の社長（当時60歳）と社員（当時48歳）を動物愛護法違反（虐待）の疑いで逮捕。飼育していた約1000匹のうち約400匹を虐待した疑いと報じられている（報道により肩書は「社長」「前代表」と表記が異なる）。', array['shinmai-20211104', 'bunshun-49891']::text[], 1),
    ('2022-03', null, '初公判', '長野地裁松本支部で初公判が開かれたと報じられている。', array['frau-124198', 'president-86294']::text[], 2),
    ('2024-02-13', null, '求刑の報道', '検察側が動物愛護法違反の罪で懲役1年、狂犬病予防法違反の罪で罰金10万円を求刑したと報じられた。', array['frau-124198']::text[], 3),
    ('2024-05-10', null, '長野地裁松本支部が判決', '会社役員・百瀬耕二被告（63歳）に懲役1年・執行猶予3年、罰金10万円の判決。2021年に2カ所の犬舎で飼育していた450匹以上の犬を不衛生な環境で衰弱させたこと、獣医師免許がないのに妊娠した5匹に麻酔なしで帝王切開を行ったこと、8匹に予防接種を受けさせなかったことが報じられている。', array['daily-20240512']::text[], 4)
  ) as v(event_date, date_note, title, description, source_keys, sort_order)
)
insert into public.case_facts (case_id, body, source_keys, sort_order)
select c.id, v.* from c, (values
  ('長野県松本市のペット繁殖場「アニマル桃太郎」。2カ所の繁殖場で約1000頭の犬を飼育していたとされる。', array['bunshun-49891']::text[], 0),
  ('逮捕容疑は動物愛護法違反（虐待）。飼育していた約1000匹のうち約400匹を虐待した疑いと報じられている。', array['shinmai-20211104', 'bunshun-49891']::text[], 1),
  ('判決では、動物愛護法違反と狂犬病予防法違反が問われ、懲役1年・執行猶予3年、罰金10万円が言い渡されたと報じられている。', array['daily-20240512']::text[], 2),
  ('長野県警の家宅捜索時が、松本市保健所による初めての立ち入り検査だったと報じられている。', array['president-86294']::text[], 3)
) as v(body, source_keys, sort_order);

-- good-business/ehime-veterinary-medical-association
with c as (
  insert into public.cases (category, slug, title, summary, case_status, status_note, person_name, business_name, business_type, region, animal_type, occurred_at, reported_on, current_status, issues, administrative_actions, legal_progress, initiatives, listing_reason, certifications, publish_status, content_updated_on, published_at)
  values ('good-business', 'ehime-veterinary-medical-association', '公益社団法人愛媛県獣医師会（令和7年度 動物愛護管理功労者 環境大臣表彰）', '令和7年度の動物愛護管理功労者環境大臣表彰を受賞した団体。愛媛県と共催の動物愛護フェスティバル、地域猫活動支援としての会員動物病院での雌猫不妊手術、災害時の動物救護活動などが功績として挙げられています。', '公的表彰', null, null, '公益社団法人愛媛県獣医師会', '獣医師団体（公益社団法人）', '愛媛県', '犬・猫ほか', null, null, '2025年9月26日に令和7年度動物愛護管理功労者として環境大臣表彰を受けました（環境省発表）。掲載内容は環境省の公表資料に基づきます。', '{}'::text[], '{}'::text[], '{}'::text[], array['平成4年から愛媛県と共催で動物愛護フェスティバルを開催。動物園との共催による動物ふれあい教室、小学校での適正飼養啓発事業も実施。', '地域猫活動の支援として、県・市町からの一部助成により、会員動物病院で無料の雌猫不妊手術を実施。', '災害時の動物救護活動について平成24年3月に愛媛県と協定を締結し、県総合防災訓練に毎年参加。県内市町とも災害協定を締結。', '愛媛県から負傷動物として収容された犬猫の治療を受託。', '愛媛県動物愛護センターから譲渡される犬猫の不妊去勢手術を受託。']::text[], '環境省が公表した令和7年度動物愛護管理功労者表彰（環境大臣表彰）の受賞団体であるため。', '[{"name":"令和7年度 動物愛護管理功労者表彰（環境大臣表彰）","grantor":"環境大臣（環境省）","date":"2025-09-26","sourceKeys":["env-press-00653","env-r7-winners"]}]'::jsonb, 'published', '2026-10-07', now())
  returning id
),
s as (
  insert into public.case_sources (case_id, key, publisher, title, published_on, url, kind, sort_order)
  select c.id, v.* from c, (values
    ('env-press-00653', '環境省', '令和７年度動物愛護管理功労者表彰について', '2025-09-09'::date, 'https://www.env.go.jp/press/press_00653.html', '公的機関', 0),
    ('env-r7-winners', '環境省', '（別紙）令和７年度 動物愛護管理功労者表彰の受賞者［PDF］', '2025-09-09'::date, 'https://www.env.go.jp/content/000253176.pdf', '公的機関', 1)
  ) as v(key, publisher, title, published_on, url, kind, sort_order)
),
t as (
  insert into public.case_timeline_events (case_id, event_date, date_note, title, description, source_keys, sort_order)
  select c.id, v.* from c, (values
    ('1945-05', null, '愛媛県獣医師会設立', null, array['env-r7-winners']::text[], 0),
    ('1992', null, '動物愛護フェスティバルの開催開始', '愛媛県と共催で開催。', array['env-r7-winners']::text[], 1),
    ('2012-03', null, '愛媛県と災害時の動物救護活動に関する協定を締結', null, array['env-r7-winners']::text[], 2),
    ('2013-04', null, '公益社団法人に認定', null, array['env-r7-winners']::text[], 3),
    ('2018-07', null, '平成30年7月豪雨での活動', '物資提供や被災ペットの無料診療等の活動が認められ、環境大臣表彰を授与されたとされる。', array['env-r7-winners']::text[], 4),
    ('2025-09-09', null, '環境省が令和7年度動物愛護管理功労者表彰の受賞者を発表', null, array['env-press-00653']::text[], 5),
    ('2025-09-26', null, '環境大臣表彰', null, array['env-press-00653']::text[], 6)
  ) as v(event_date, date_note, title, description, source_keys, sort_order)
)
insert into public.case_facts (case_id, body, source_keys, sort_order)
select c.id, v.* from c, (values
  ('環境省は、動物の愛護と適正な管理の推進に関して顕著な功績のあった者・団体として、令和7年度に個人3名・1団体を表彰すると発表した。', array['env-press-00653']::text[], 0),
  ('受賞団体は公益社団法人愛媛県獣医師会。', array['env-r7-winners']::text[], 1),
  ('功績概要として、動物愛護の普及啓発、地域猫活動の支援、災害時の動物救護、負傷動物の治療受託、譲渡動物の不妊去勢手術受託が挙げられている。', array['env-r7-winners']::text[], 2)
) as v(body, source_keys, sort_order);

commit;
