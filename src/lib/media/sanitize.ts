/**
 * 画像ファイルのサーバー側検証とメタデータ除去（追加ライブラリなし）。
 *
 * - 形式はファイル先頭のバイト列（マジックナンバー）で判定し、宣言された MIME タイプや拡張子は信用しない
 * - JPEG / PNG / WebP の構造を解析し、EXIF（撮影位置・端末情報など）・XMP・コメント等のメタデータを取り除く
 * - 構造が壊れている・想定外のファイルは拒否する
 *
 * ブラウザ側でも canvas で再エンコードしてメタデータを除去しているが、
 * 改変されたクライアントからの送信に備えてサーバー側でも必ず実行する。
 */

export type SanitizedImage = {
  bytes: Uint8Array;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export class ImageValidationError extends Error {}

export function detectImageType(bytes: Uint8Array): SanitizedImage["mimeType"] | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)) {
    return "image/png";
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "image/webp";
  return null;
}

export function sanitizeImage(bytes: Uint8Array): SanitizedImage {
  const mimeType = detectImageType(bytes);
  switch (mimeType) {
    case "image/jpeg":
      return { mimeType, bytes: stripJpeg(bytes) };
    case "image/png":
      return { mimeType, bytes: stripPng(bytes) };
    case "image/webp":
      return { mimeType, bytes: stripWebp(bytes) };
    default:
      throw new ImageValidationError("unsupported");
  }
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// JPEG：APP1（EXIF / XMP）、APP13（IPTC）、COM（コメント）セグメントを除去する
// ---------------------------------------------------------------------------
const JPEG_DROP_MARKERS = new Set([0xe1, 0xed, 0xfe]);

function stripJpeg(bytes: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let i = 2;

  while (i < bytes.length) {
    if (bytes[i] !== 0xff) throw new ImageValidationError("broken jpeg");
    const marker = bytes[i + 1];
    if (marker === undefined) throw new ImageValidationError("broken jpeg");

    // 単独マーカー（長さを持たない）
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      parts.push(bytes.subarray(i, i + 2));
      i += 2;
      continue;
    }
    if (marker === 0xd9) {
      parts.push(bytes.subarray(i, i + 2));
      return concat(parts);
    }

    if (i + 4 > bytes.length) throw new ImageValidationError("broken jpeg");
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    const end = i + 2 + length;
    if (length < 2 || end > bytes.length) throw new ImageValidationError("broken jpeg");

    // SOS 以降は圧縮データ。末尾までそのまま残す
    if (marker === 0xda) {
      parts.push(bytes.subarray(i));
      return concat(parts);
    }
    if (!JPEG_DROP_MARKERS.has(marker)) parts.push(bytes.subarray(i, end));
    i = end;
  }
  throw new ImageValidationError("broken jpeg");
}

// ---------------------------------------------------------------------------
// PNG：eXIf・テキスト系チャンク・更新日時チャンクを除去する
// ---------------------------------------------------------------------------
const PNG_DROP_CHUNKS = new Set(["eXIf", "tEXt", "iTXt", "zTXt", "tIME"]);

function stripPng(bytes: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let i = 8;

  while (i + 12 <= bytes.length) {
    const length = view.getUint32(i);
    const type = ascii(bytes, i + 4, 4);
    const end = i + 12 + length;
    if (end > bytes.length || !/^[A-Za-z]{4}$/.test(type)) throw new ImageValidationError("broken png");

    if (!PNG_DROP_CHUNKS.has(type)) parts.push(bytes.subarray(i, end));
    i = end;
    if (type === "IEND") return concat(parts);
  }
  throw new ImageValidationError("broken png");
}

// ---------------------------------------------------------------------------
// WebP：EXIF・XMP チャンクを除去し、VP8X のフラグと RIFF サイズを更新する
// ---------------------------------------------------------------------------
const WEBP_DROP_CHUNKS = new Set(["EXIF", "XMP "]);

function stripWebp(bytes: Uint8Array): Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const riffEnd = 8 + view.getUint32(4, true);
  if (riffEnd > bytes.length) throw new ImageValidationError("broken webp");

  const chunks: Uint8Array[] = [];
  let i = 12;
  while (i + 8 <= riffEnd) {
    const type = ascii(bytes, i, 4);
    const size = view.getUint32(i + 4, true);
    const end = i + 8 + size + (size % 2);
    if (end > riffEnd) throw new ImageValidationError("broken webp");

    if (!WEBP_DROP_CHUNKS.has(type)) {
      const chunk = bytes.slice(i, end);
      // VP8X のフラグから EXIF(0x08)・XMP(0x04) の存在ビットを落とす
      if (type === "VP8X" && size >= 1) chunk[8] &= ~0x0c;
      chunks.push(chunk);
    }
    i = end;
  }
  if (chunks.length === 0) throw new ImageValidationError("broken webp");

  const body = concat(chunks);
  const header = new Uint8Array(12);
  header.set(bytes.subarray(0, 4), 0);
  new DataView(header.buffer).setUint32(4, 4 + body.length, true);
  header.set(bytes.subarray(8, 12), 8);
  return concat([header, body]);
}

// ---------------------------------------------------------------------------
// 画像サイズの読み取り（表示時のレイアウト崩れ防止用。読めない場合は null）
// ---------------------------------------------------------------------------
export function readImageSize(image: SanitizedImage): { width: number; height: number } | null {
  const { bytes, mimeType } = image;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  try {
    if (mimeType === "image/png") {
      return { width: view.getUint32(16), height: view.getUint32(20) };
    }
    if (mimeType === "image/jpeg") {
      let i = 2;
      while (i + 9 < bytes.length) {
        const marker = bytes[i + 1];
        const length = view.getUint16(i + 2);
        const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
        if (isSof) return { height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
        if (marker === 0xda) return null;
        i += 2 + length;
      }
      return null;
    }
    // WebP：先頭チャンクの種類に応じて読む
    const type = ascii(bytes, 12, 4);
    const data = 20;
    if (type === "VP8X") {
      const width = 1 + (bytes[data + 4] | (bytes[data + 5] << 8) | (bytes[data + 6] << 16));
      const height = 1 + (bytes[data + 7] | (bytes[data + 8] << 8) | (bytes[data + 9] << 16));
      return { width, height };
    }
    if (type === "VP8 ") {
      return { width: view.getUint16(data + 6, true) & 0x3fff, height: view.getUint16(data + 8, true) & 0x3fff };
    }
    if (type === "VP8L") {
      const bits = view.getUint32(data + 1, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  } catch {
    return null;
  }
}
