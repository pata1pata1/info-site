import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";

/** 寸法・文字・枠線幅・フォーカス表示などは全バリアント共通。違いは色（背景・枠線・発光）だけ */
const baseClass =
  "inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold tracking-wide whitespace-nowrap transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night active:translate-y-px [&>svg]:size-[18px] [&>svg]:shrink-0";

const variantClass: Record<Variant, string> = {
  primary:
    "border-cyan-300/50 bg-gradient-to-r from-blue-500/25 to-cyan-400/25 text-cyan-50 shadow-[0_0_20px_-8px_rgb(34_211_238/0.6)] hover:border-cyan-200/70 hover:from-blue-500/35 hover:to-cyan-400/35 hover:shadow-[0_0_28px_-6px_rgb(34_211_238/0.7)] active:shadow-[0_0_16px_-8px_rgb(34_211_238/0.6)]",
  secondary:
    "border-cyan-300/25 bg-night-2/70 text-slate-200 hover:border-cyan-300/45 hover:bg-cyan-500/10 hover:text-cyan-50 hover:shadow-[0_0_22px_-10px_rgb(34_211_238/0.5)] active:bg-cyan-500/[0.06]",
};

type Props = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  /** 文字の左に置くアイコン（サイズは 18px にそろえる） */
  icon?: ReactNode;
  className?: string;
};

/** ヒーローなどで並べるリンクボタン。primary / secondary で色だけを切り替える */
export function ButtonLink({ variant = "secondary", icon, className, children, ...props }: Props) {
  return (
    <Link {...props} className={`${baseClass} ${variantClass[variant]}${className ? ` ${className}` : ""}`}>
      {icon}
      {children}
    </Link>
  );
}
