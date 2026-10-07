import type { NextConfig } from "next";

// 情報提供コメントの画像添付（最大5枚 × 5MB）を Server Action で受け取るための上限。
// multipart の境界などのオーバーヘッド分を見込んで少し大きめにしている。
const UPLOAD_BODY_LIMIT = "26mb";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: UPLOAD_BODY_LIMIT,
    },
    // proxy（セッション更新）を通るリクエストの本文バッファ上限。既定の10MBでは画像が途中で切れる
    proxyClientMaxBodySize: UPLOAD_BODY_LIMIT,
  },
};

export default nextConfig;
