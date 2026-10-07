/** 日本列島を簡略化したアイコン（都道府県から探す） */
export function JapanMapIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* 北海道 */}
      <path d="M16.8 2.8l2.6-.3 1.6 1.6-.9 2.1-2.2.4-1.6-1.4z" />
      {/* 本州 */}
      <path d="M17 8.6c.2 1.8-.5 3.5-1.9 4.8-1.7 1.5-3.9 2.2-6.2 2.8" />
      {/* 四国 */}
      <path d="M10 18.2h2.6" />
      {/* 九州 */}
      <path d="M5.4 16.9l1.3.4-.2 2.4-1.6.8-.8-1.7z" />
      {/* 沖縄 */}
      <path d="M2.8 21.6h.01" />
    </svg>
  );
}
