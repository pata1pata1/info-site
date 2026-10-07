import { imageRule, type MediaRule } from "./config";

/**
 * ブラウザ側での画像の前処理。
 * canvas に描き直して再エンコードすることで、EXIF（撮影位置・端末情報など）を含むメタデータを取り除く。
 * スマートフォン写真の回転情報（EXIF Orientation）は描画時に反映してから除去する。
 * 大きすぎる画像は長辺 maxEdge px（既定 2560px）に縮小して送信サイズを抑える。
 */

const DEFAULT_MAX_EDGE = 2560;
const WEBP_QUALITY = 0.88;
const JPEG_QUALITY = 0.9;

export type PreparedImage = {
  id: string;
  blob: Blob;
  previewUrl: string;
  /** 元のファイル名（画面表示のみ。送信・保存には使わない） */
  originalName: string;
  width: number;
  height: number;
};

export class PrepareImageError extends Error {}

/** 選択されたファイルの事前チェック（最終的な判定はサーバー側で行う） */
export function checkSelectedFile(file: File, rule: MediaRule = imageRule): string | null {
  if (!rule.mimeTypes.includes(file.type)) {
    return `「${file.name}」は対応していない形式です（${rule.label}のみ）。`;
  }
  if (file.size > rule.maxBytes) {
    return `「${file.name}」は${rule.maxBytes / 1024 / 1024}MBを超えています。`;
  }
  return null;
}

type PrepareOptions = { rule?: MediaRule; maxEdge?: number };

export async function prepareImage(file: File, { rule = imageRule, maxEdge = DEFAULT_MAX_EDGE }: PrepareOptions = {}): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PrepareImageError(`「${file.name}」を画像として読み込めませんでした。`);
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new PrepareImageError("画像を処理できませんでした。");
  context.drawImage(bitmap, 0, 0, width, height);

  // WebP に対応していないブラウザ（toBlob が PNG を返す）では JPEG にする
  let blob = await toBlob(canvas, "image/webp", WEBP_QUALITY);
  if (!blob || blob.type !== "image/webp") {
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    blob = await toBlob(canvas, "image/jpeg", JPEG_QUALITY);
  }
  bitmap.close();

  if (!blob) throw new PrepareImageError("画像を処理できませんでした。");
  if (blob.size > rule.maxBytes) {
    throw new PrepareImageError(`「${file.name}」は処理後も${rule.maxBytes / 1024 / 1024}MBを超えています。`);
  }

  return { id: crypto.randomUUID(), blob, previewUrl: URL.createObjectURL(blob), originalName: file.name, width, height };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
