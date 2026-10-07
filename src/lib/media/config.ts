/**
 * 情報提供コメントの添付メディア設定。
 * 将来動画を追加する場合は MediaKind に "video" を加え、mediaRules に許可形式・上限を追加する。
 */
export type MediaKind = "image";

export const ATTACHMENT_BUCKET = "comment-evidence";
export const MAX_ATTACHMENTS = 5;

export type MediaRule = {
  /** 受け付ける MIME タイプ（拡張子ではなくファイル先頭のバイト列で判定する） */
  mimeTypes: readonly string[];
  maxBytes: number;
  label: string;
};

export const mediaRules: Record<MediaKind, MediaRule> = {
  image: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * 1024 * 1024,
    label: "JPEG / PNG / WebP",
  },
};

export const imageRule = mediaRules.image;

export const extensionByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** 案件メイン画像（管理者のみ） */
export const CASE_IMAGE_BUCKET = "case-images";
export const caseImageRule: MediaRule = {
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 10 * 1024 * 1024,
  label: "JPEG / PNG / WebP",
};
