import type { AnimalAbuseCase } from "../types";

/**
 * 動物虐待事案。
 * 記載内容は各 Source に書かれている事実のみ。情報源にない事項（控訴の有無など）は「記載なし」と明記する。
 */
export const animalAbuseCases: AnimalAbuseCase[] = [
  {
    slug: "saitama-cat-abuse-video-2017",
    category: "animal-abuse",
    title: "猫13匹の虐待・殺傷を動画撮影し投稿した事件",
    summary:
      "2016年3月〜2017年4月、埼玉県内で猫13匹に熱湯をかける、ガスバーナーであぶるなどして9匹を殺し4匹に重傷を負わせ、その様子を動画で投稿したとして、元税理士の男性が動物愛護法違反の罪に問われた事件。2017年12月、東京地裁で懲役1年10月・執行猶予4年の判決が言い渡されたと報じられています。",
    personName: "大矢誠（報道時52歳・元税理士）",
    region: "埼玉県",
    animalType: "猫",
    occurredAt: "2016年3月〜2017年4月",
    reportedAt: "2017-10-03",
    status: "有罪判決",
    statusNote:
      "2017年12月12日の東京地裁判決。控訴の有無・判決確定については、本ページで確認した情報源には記載がありません。",
    timeline: [
      {
        date: "2016-03",
        dateNote: "〜2017年4月",
        title: "猫13匹への虐待",
        description:
          "猫13匹に熱湯をかけたり、ガスバーナーであぶるなどして虐待し、9匹を殺し、4匹に重傷を負わせたとされる。虐待の様子は動画撮影され、インターネット上に投稿されていたと報じられている。",
        sourceIds: ["jprime-10739", "jprime-11219", "tospo-13634"],
      },
      {
        date: "2017-08-27",
        title: "警視庁保安課が逮捕",
        description: "動物愛護法違反の疑いで逮捕。その後、東京地検が起訴したと報じられている（起訴日は情報源に記載なし）。",
        sourceIds: ["jprime-10739"],
      },
      {
        date: "2017-11-28",
        title: "東京地裁で初公判",
        description: "被告は起訴内容を認めたと報じられている。",
        sourceIds: ["jprime-11219"],
      },
      {
        date: "2017-12-12",
        title: "東京地裁が判決",
        description: "懲役1年10月、執行猶予4年の判決が言い渡されたと報じられている。",
        sourceIds: ["tospo-13634"],
      },
    ],
    facts: [
      {
        text: "被告は元税理士の大矢誠氏（報道時52歳）。罪名は動物愛護法違反。",
        sourceIds: ["jprime-11219", "tospo-13634"],
      },
      {
        text: "対象は猫13匹で、うち9匹が死亡、4匹が重傷を負ったとされる。",
        sourceIds: ["jprime-11219", "tospo-13634"],
      },
      {
        text: "犯行期間は2016年3月から2017年4月とされる。",
        sourceIds: ["jprime-11219", "tospo-13634"],
      },
      {
        text: "虐待の様子を撮影した動画がインターネット上に投稿されていたと報じられている。",
        sourceIds: ["jprime-10739", "jprime-11219"],
      },
    ],
    legalProgress: [
      "2017年8月27日：警視庁保安課が動物愛護法違反の疑いで逮捕",
      "東京地検が起訴（起訴日は情報源に記載なし）",
      "2017年11月28日：東京地裁で初公判。被告は起訴内容を認めた",
      "2017年12月12日：東京地裁が懲役1年10月・執行猶予4年の判決",
    ],
    currentStatus:
      "2017年12月12日、東京地裁で懲役1年10月・執行猶予4年の有罪判決が言い渡されたと報じられています。控訴の有無や判決の確定、その後の状況については、本ページで確認した情報源には記載がありません。",
    sources: [
      {
        id: "jprime-10739",
        publisher: "週刊女性PRIME",
        title: "＜埼玉・深谷市＞猫虐待殺傷の一部始終を動画撮影した、鬼畜男の正体",
        publishedAt: "2017-10-03",
        url: "https://www.jprime.jp/articles/-/10739",
        kind: "報道",
      },
      {
        id: "toyokeizai-192795",
        publisher: "東洋経済オンライン（週刊女性PRIME編集部）",
        title: "猫を殺傷し動画公開した､ある税理士の実像 ガスバーナーで焼かれ黒焦げに…",
        publishedAt: "2017-10-14",
        url: "https://toyokeizai.net/articles/-/192795",
        kind: "報道",
      },
      {
        id: "jprime-11219",
        publisher: "週刊女性PRIME",
        title: "＜猫虐待殺傷事件初公判＞駆除が一転、猫への復讐と残虐殺害動画が目的に",
        publishedAt: "2017-12-05",
        url: "https://www.jprime.jp/articles/-/11219",
        kind: "報道",
      },
      {
        id: "tospo-13634",
        publisher: "東スポWEB",
        title: "【猫惨殺裁判】杉本彩　執行猶予判決に怒る「法律で裁かれなくても見合った罰は下るはず」",
        publishedAt: "2017-12-13",
        url: "https://www.tokyo-sports.co.jp/articles/-/13634",
        kind: "報道",
      },
    ],
    updatedAt: "2026-10-07",
  },
];
