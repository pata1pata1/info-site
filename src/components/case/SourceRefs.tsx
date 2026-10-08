import type { Source } from "@/lib/cases";

/** 本文中の情報源参照（[1][2] …）。ページ下部の情報源へリンクする */
export function SourceRefs({ ids, sources }: { ids: string[]; sources: Source[] }) {
  // 参照先の情報源がない（未ログインで情報源を表示しない場合など）ときは何も出さない
  if (!ids.some((id) => sources.some((s) => s.id === id))) return null;
  return (
    <span className="ml-1 inline-flex gap-0.5 align-super text-[10px] font-normal">
      {ids.map((id) => {
        const index = sources.findIndex((s) => s.id === id);
        if (index < 0) return null;
        return (
          <a
            key={id}
            href={`#source-${id}`}
            className="font-mono text-cyan-300/80 hover:text-cyan-200"
            aria-label={`情報源${index + 1}：${sources[index].publisher}`}
          >
            [{index + 1}]
          </a>
        );
      })}
    </span>
  );
}
