import { Fragment } from "react";
import { parseRichText, type Inline } from "@/lib/richtext";

type Props = {
  source: string;
  className?: string;
};

/** 簡易リッチテキストの表示（HTML を解釈しないため安全） */
export function RichText({ source, className = "" }: Props) {
  const blocks = parseRichText(source);
  if (blocks.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h3" : "h4";
          return (
            <Tag key={i} className={`font-bold text-slate-100 ${block.level === 2 ? "pt-1 text-base" : "text-sm"}`}>
              <Inlines items={block.content} />
            </Tag>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="space-y-1">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-cyan-300/70" aria-hidden="true" />
                  <span>
                    <Inlines items={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inlines items={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function Inlines({ items }: { items: Inline[] }) {
  return items.map((item, i) => {
    if (item.type === "bold") return <strong key={i} className="font-bold text-slate-100">{item.text}</strong>;
    if (item.type === "link") {
      const external = item.href.startsWith("http");
      return (
        <a
          key={i}
          href={item.href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-cyan-300 underline decoration-cyan-300/30 underline-offset-2 hover:text-cyan-200"
        >
          {item.text}
        </a>
      );
    }
    return <Fragment key={i}>{item.text}</Fragment>;
  });
}
