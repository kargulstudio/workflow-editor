import type { ReactNode } from "react";
import type { ExportFormat } from "./export-formats";

type ExportPreviewProps = {
  content: string;
  format: ExportFormat;
};

function highlightJson(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern =
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  let cursor = 0;
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(line.slice(cursor, index));
    if (match[1] && match[2]) {
      parts.push(
        <span key={index} className="text-[#9875ff]">
          {match[1]}
        </span>,
        match[2],
      );
    } else if (match[1]) {
      parts.push(
        <span key={index} className="text-[#75ffd3]">
          {match[1]}
        </span>,
      );
    } else {
      parts.push(
        <span key={index} className="text-[#ffb575]">
          {match[0]}
        </span>,
      );
    }
    cursor = index + match[0].length;
  }
  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts;
}

function highlight(line: string, format: ExportFormat): ReactNode {
  if (format === "json") return highlightJson(line);
  if (format === "markdown") {
    if (line.startsWith("#"))
      return <span className="font-semibold text-white">{line}</span>;
    if (line.startsWith(">"))
      return <span className="text-white/50">{line}</span>;
    return line.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
      part.startsWith("**") ? (
        <span key={index} className="text-[#ff75e3]">
          {part}
        </span>
      ) : (
        part
      ),
    );
  }
  return line.split(",").map((cell, index, cells) => (
    <span key={index}>
      <span
        className={
          index === 0
            ? "text-[#ffb575]"
            : index === 1
              ? "text-[#9875ff]"
              : undefined
        }
      >
        {cell}
      </span>
      {index < cells.length - 1 && <span className="text-white/30">,</span>}
    </span>
  ));
}

export default function ExportPreview({ content, format }: ExportPreviewProps) {
  const lines = content.split("\n");

  return (
    <pre className="min-h-0 flex-1 overflow-auto rounded-[12px] bg-black/30 py-3 font-mono text-[12.5px] leading-5 text-white/75 shadow-[0_0_0_1px_rgb(0_0_0/0.24),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
      <code className="grid min-w-max grid-cols-[auto_1fr]">
        {lines.map((line, index) => (
          <span key={index} className="contents">
            <span className="px-3 text-right text-white/20 tabular-nums select-none">
              {index + 1}
            </span>
            <span className="pr-4 whitespace-pre">
              {highlight(line, format)}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
