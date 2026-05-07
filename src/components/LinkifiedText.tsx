import { useState } from "react";

type LinkifiedTextProps = {
  text?: string;
  className?: string;
  collapsedLines?: number;
};

const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

function getHref(url: string) {
  return url.startsWith("www.") ? `https://${url}` : url;
}

function shouldCollapse(text: string, collapsedLines?: number) {
  if (!collapsedLines) return false;
  const lines = text.split(/\r?\n/).length;
  return lines > collapsedLines || text.length > 180;
}

export function LinkifiedText({ text, className = "", collapsedLines }: LinkifiedTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text?.trim()) return null;

  const parts = text.split(urlRegex);
  const canCollapse = shouldCollapse(text, collapsedLines);
  const collapsedStyle =
    canCollapse && !expanded
      ? {
          display: "-webkit-box",
          WebkitLineClamp: collapsedLines,
          WebkitBoxOrient: "vertical" as const,
        }
      : undefined;

  return (
    <div className={`max-w-full min-w-0 overflow-hidden text-sm leading-relaxed text-slate-300 ${className}`}>
      <div className="max-w-full min-w-0 whitespace-pre-wrap break-words overflow-hidden" style={collapsedStyle}>
        {parts.map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={`${part}-${index}`}
                href={getHref(part)}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline text-indigo-300 hover:text-indigo-200"
              >
                {part}
              </a>
            );
          }

          return <span key={`${part}-${index}`}>{part}</span>;
        })}
      </div>

      {canCollapse && (
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-violet-300 hover:text-violet-200"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Свернуть" : "Показать полностью"}
        </button>
      )}
    </div>
  );
}
