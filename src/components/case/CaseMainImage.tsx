/* eslint-disable @next/next/no-img-element -- Supabase Storage の公開URLをそのまま表示する（next/image のドメイン設定を不要にするため） */
import type { MainImage } from "@/lib/cases";

/** 案件のメイン画像（本文幅・16:9） */
export function CaseMainImage({ image }: { image: MainImage }) {
  return (
    <figure className="mt-6">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-night-2 ring-1 ring-line-strong shadow-[0_16px_48px_-24px_rgb(34_211_238/0.35)]">
        <img
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>
      {(image.caption || image.sourceName) && (
        <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-slate-400">
          {image.caption && <span>{image.caption}</span>}
          {image.sourceName && (
            <span className="text-slate-500">
              出典：
              {image.sourceUrl ? (
                <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300/80 hover:text-cyan-200">
                  {image.sourceName}
                </a>
              ) : (
                image.sourceName
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
