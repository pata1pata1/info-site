import type { GoodBusinessCase } from "../types";

/**
 * 優良動物関連事業者。
 * 公的機関の認定・表彰、第三者認証、信頼できる報道など、掲載理由を確認できるものに限る。
 */
export const goodBusinessCases: GoodBusinessCase[] = [
  {
    slug: "ehime-veterinary-medical-association",
    category: "good-business",
    title: "公益社団法人愛媛県獣医師会（令和7年度 動物愛護管理功労者 環境大臣表彰）",
    summary:
      "令和7年度の動物愛護管理功労者環境大臣表彰を受賞した団体。愛媛県と共催の動物愛護フェスティバル、地域猫活動支援としての会員動物病院での雌猫不妊手術、災害時の動物救護活動などが功績として挙げられています。",
    businessName: "公益社団法人愛媛県獣医師会",
    businessType: "獣医師団体（公益社団法人）",
    region: "愛媛県",
    animalType: "犬・猫ほか",
    status: "公的表彰",
    initiatives: [
      "平成4年から愛媛県と共催で動物愛護フェスティバルを開催。動物園との共催による動物ふれあい教室、小学校での適正飼養啓発事業も実施。",
      "地域猫活動の支援として、県・市町からの一部助成により、会員動物病院で無料の雌猫不妊手術を実施。",
      "災害時の動物救護活動について平成24年3月に愛媛県と協定を締結し、県総合防災訓練に毎年参加。県内市町とも災害協定を締結。",
      "愛媛県から負傷動物として収容された犬猫の治療を受託。",
      "愛媛県動物愛護センターから譲渡される犬猫の不妊去勢手術を受託。",
    ],
    listingReason:
      "環境省が公表した令和7年度動物愛護管理功労者表彰（環境大臣表彰）の受賞団体であるため。",
    certifications: [
      {
        name: "令和7年度 動物愛護管理功労者表彰（環境大臣表彰）",
        grantor: "環境大臣（環境省）",
        date: "2025-09-26",
        sourceIds: ["env-press-00653", "env-r7-winners"],
      },
    ],
    timeline: [
      {
        date: "1945-05",
        title: "愛媛県獣医師会設立",
        sourceIds: ["env-r7-winners"],
      },
      {
        date: "1992",
        title: "動物愛護フェスティバルの開催開始",
        description: "愛媛県と共催で開催。",
        sourceIds: ["env-r7-winners"],
      },
      {
        date: "2012-03",
        title: "愛媛県と災害時の動物救護活動に関する協定を締結",
        sourceIds: ["env-r7-winners"],
      },
      {
        date: "2013-04",
        title: "公益社団法人に認定",
        sourceIds: ["env-r7-winners"],
      },
      {
        date: "2018-07",
        title: "平成30年7月豪雨での活動",
        description: "物資提供や被災ペットの無料診療等の活動が認められ、環境大臣表彰を授与されたとされる。",
        sourceIds: ["env-r7-winners"],
      },
      {
        date: "2025-09-09",
        title: "環境省が令和7年度動物愛護管理功労者表彰の受賞者を発表",
        sourceIds: ["env-press-00653"],
      },
      {
        date: "2025-09-26",
        title: "環境大臣表彰",
        sourceIds: ["env-press-00653"],
      },
    ],
    facts: [
      {
        text: "環境省は、動物の愛護と適正な管理の推進に関して顕著な功績のあった者・団体として、令和7年度に個人3名・1団体を表彰すると発表した。",
        sourceIds: ["env-press-00653"],
      },
      {
        text: "受賞団体は公益社団法人愛媛県獣医師会。",
        sourceIds: ["env-r7-winners"],
      },
      {
        text: "功績概要として、動物愛護の普及啓発、地域猫活動の支援、災害時の動物救護、負傷動物の治療受託、譲渡動物の不妊去勢手術受託が挙げられている。",
        sourceIds: ["env-r7-winners"],
      },
    ],
    currentStatus:
      "2025年9月26日に令和7年度動物愛護管理功労者として環境大臣表彰を受けました（環境省発表）。掲載内容は環境省の公表資料に基づきます。",
    sources: [
      {
        id: "env-press-00653",
        publisher: "環境省",
        title: "令和７年度動物愛護管理功労者表彰について",
        publishedAt: "2025-09-09",
        url: "https://www.env.go.jp/press/press_00653.html",
        kind: "公的機関",
      },
      {
        id: "env-r7-winners",
        publisher: "環境省",
        title: "（別紙）令和７年度 動物愛護管理功労者表彰の受賞者［PDF］",
        publishedAt: "2025-09-09",
        url: "https://www.env.go.jp/content/000253176.pdf",
        kind: "公的機関",
      },
    ],
    updatedAt: "2026-10-07",
  },
];
