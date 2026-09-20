import React from "react";

interface MarkdownRendererProps {
  content: string;
  isAI?: boolean;
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and [links](url)
 */
function parseInline(text: string): React.ReactNode[] {
  // Strip any accidental leading markdown hashes that might be inline
  const cleanText = text.replace(/^#{1,6}\s+/, "");

  // Regex matches:
  // 1. **bold**
  // 2. *italic* (not followed or preceded by *)
  // 3. `inline code`
  // 4. [link](url)
  const regex = /(\*\*[^*]+?\*\*|(?<!\*)\*[^*]+?\*(?!\*)|`[^`]+?`|\[[^\]]+\]\([^)]+\))/g;
  const parts = cleanText.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-gray-900">
          {parseInline(part.slice(2, -2))}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
      return (
        <em key={index} className="italic text-gray-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-[13px] font-mono font-medium text-teal-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0e6f68] font-semibold underline underline-offset-2 hover:text-[#0a524d]"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/**
 * Konversi tabel Markdown (| Kolom 1 | Kolom 2 |) menjadi Full Teks terstruktur (kartu/daftar poin)
 * agar tidak pernah menyempit atau berantakan di layar chat
 */
function renderTableAsFullText(lines: string[], bIdx: number, isAI: boolean) {
  const cleanLines = lines.map((l) => l.trim()).filter(Boolean);
  const separatorIdx = cleanLines.findIndex((l) => /^\|?\s*[-:]+[-|\s:]*\|?$/.test(l));
  if (separatorIdx === -1) return null;

  const parseCells = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

  const headers = parseCells(cleanLines[0]);
  const rows: string[][] = [];

  for (let i = separatorIdx + 1; i < cleanLines.length; i++) {
    const cells = parseCells(cleanLines[i]);
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) return null;

  return (
    <div key={bIdx} className="space-y-2.5 my-2 w-full">
      {rows.map((row, rIdx) => (
        <div
          key={rIdx}
          className={`p-3.5 rounded-2xl border ${
            isAI
              ? "bg-white/95 border-teal-100 shadow-2xs"
              : "bg-white/10 border-white/20"
          } space-y-1.5`}
        >
          {row.map((cell, cIdx) => {
            const h = headers[cIdx];
            return (
              <div key={cIdx} className="text-xs sm:text-sm leading-relaxed flex flex-col sm:flex-row sm:items-start gap-1">
                {h && (
                  <span className="font-bold text-[#0e6f68] sm:min-w-32 flex-shrink-0">
                    {parseInline(h)}:
                  </span>
                )}
                <span className="text-gray-800 flex-1">{parseInline(cell)}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Renders full markdown with paragraphs, headers (without # leaking), full-text converted tables,
 * bullet lists, numbered lists, dividers, and bold text
 */
export default function MarkdownRenderer({ content, isAI = true }: MarkdownRendererProps) {
  if (!content) return null;

  // Split by double newline into logical blocks
  const blocks = content.split(/\n\n+/);

  return (
    <div className={`space-y-3 ${isAI ? "text-gray-800" : "text-white"}`}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Horizontal divider --- or ***
        if (trimmed === "---" || trimmed === "***") {
          return (
            <hr
              key={bIdx}
              className={`my-3 border-t ${isAI ? "border-teal-100" : "border-white/20"}`}
            />
          );
        }

        // Cek jika blok ini adalah Tabel Markdown (| Kolom 1 | Kolom 2 |)
        const blockLines = trimmed.split("\n");
        const hasTableSeparator = blockLines.some((l) => /^\|?\s*[-:]+[-|\s:]*\|?$/.test(l.trim()));
        if (hasTableSeparator && blockLines.length >= 2) {
          const tableNode = renderTableAsFullText(blockLines, bIdx, isAI);
          if (tableNode) return tableNode;
        }

        // Cek Heading dengan berapapun tanda pagar (#, ##, ###, ####, #####, ######)
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const headingText = headingMatch[2];

          if (level === 1) {
            return (
              <h2
                key={bIdx}
                className={`font-bold text-base sm:text-lg pt-2 pb-0.5 leading-snug ${
                  isAI ? "text-gray-900" : "text-white"
                }`}
              >
                {parseInline(headingText)}
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h3
                key={bIdx}
                className={`font-bold text-[15px] sm:text-base pt-1.5 pb-0.5 leading-snug ${
                  isAI ? "text-gray-900" : "text-white"
                }`}
              >
                {parseInline(headingText)}
              </h3>
            );
          }
          if (level === 3) {
            return (
              <h4
                key={bIdx}
                className={`font-bold text-sm sm:text-[15px] pt-1 pb-0.5 leading-snug flex items-center gap-1.5 ${
                  isAI ? "text-[#0e6f68]" : "text-white"
                }`}
              >
                {parseInline(headingText)}
              </h4>
            );
          }
          // Level 4, 5, 6 (####, #####, ######)
          return (
            <h5
              key={bIdx}
              className={`font-bold text-sm sm:text-[14.5px] pt-1 pb-0.5 leading-snug ${
                isAI ? "text-gray-900" : "text-white"
              }`}
            >
              {parseInline(headingText)}
            </h5>
          );
        }

        const lines = trimmed.split("\n");

        // Check if all or most lines are bullet list items (- or * at start of line)
        const isBulletList = lines.every(
          (line) => line.trim().startsWith("- ") || line.trim().startsWith("* ")
        );

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-1.5 my-1.5 pl-1.5">
              {lines.map((line, lIdx) => {
                const itemText = line.trim().replace(/^[-*]\s+/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-2 leading-relaxed text-sm sm:text-[15px]">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                        isAI ? "bg-[#0e6f68]" : "bg-white"
                      }`}
                    />
                    <div className="flex-1">{parseInline(itemText)}</div>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if all lines are numbered list items (1. , 2. )
        const isNumberedList = lines.every((line) => /^\d+\.\s+/.test(line.trim()));

        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-1.5 my-1.5 pl-1">
              {lines.map((line, lIdx) => {
                const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
                const num = match ? match[1] : `${lIdx + 1}`;
                const itemText = match ? match[2] : line;

                return (
                  <li key={lIdx} className="flex items-start gap-2.5 leading-relaxed text-sm sm:text-[15px]">
                    <span
                      className={`font-bold text-xs px-1.5 py-0.5 rounded-md mt-0.5 flex-shrink-0 ${
                        isAI
                          ? "bg-teal-100 text-[#0e6f68]"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {num}
                    </span>
                    <div className="flex-1">{parseInline(itemText)}</div>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Mixed paragraph with single line breaks
        return (
          <div key={bIdx} className="leading-relaxed text-sm sm:text-[15px] space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;

              // Tangani jika ada heading di dalam baris (misal: #### 4. Judul)
              const lineHeadingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
              if (lineHeadingMatch) {
                const hText = lineHeadingMatch[2];
                return (
                  <div
                    key={lIdx}
                    className={`font-bold text-sm sm:text-[15px] pt-1.5 pb-0.5 leading-snug ${
                      isAI ? "text-[#0e6f68]" : "text-white"
                    }`}
                  >
                    {parseInline(hText)}
                  </div>
                );
              }

              // If an individual line inside a paragraph is a bullet item
              if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
                const itemText = trimmedLine.replace(/^[-*]\s+/, "");
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2 my-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                        isAI ? "bg-[#0e6f68]" : "bg-white"
                      }`}
                    />
                    <div className="flex-1">{parseInline(itemText)}</div>
                  </div>
                );
              }

              // If an individual line is a numbered item
              const numMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1 my-1">
                    <span
                      className={`font-bold text-xs px-1.5 py-0.5 rounded-md mt-0.5 flex-shrink-0 ${
                        isAI
                          ? "bg-teal-100 text-[#0e6f68]"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {numMatch[1]}
                    </span>
                    <div className="flex-1">{parseInline(numMatch[2])}</div>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="my-0.5">
                  {parseInline(trimmedLine)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
