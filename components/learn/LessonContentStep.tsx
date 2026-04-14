"use client";

import { Fragment } from "react";
import { Button } from "@/components/ui/button";

function ChartBlock({ src }: { src: string }) {
  return (
    <div className="my-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
      [Chart: {src}]
    </div>
  );
}

function splitMarkdownAndCharts(markdown: string): Array<{ type: "markdown"; value: string } | { type: "chart"; src: string }> {
  const segments: Array<{ type: "markdown"; value: string } | { type: "chart"; src: string }> = [];
  const chartRegex = /!\[[^\]]*\]\((chart_[^)]+\.png)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = chartRegex.exec(markdown)) !== null) {
    const src = m[1];
    if (m.index > lastIndex) {
      segments.push({ type: "markdown", value: markdown.slice(lastIndex, m.index) });
    }
    segments.push({ type: "chart", src });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < markdown.length) {
    segments.push({ type: "markdown", value: markdown.slice(lastIndex) });
  }
  return segments.length > 0 ? segments : [{ type: "markdown", value: markdown }];
}

function renderInlineFormatting(text: string) {
  const chunks = text.split(/(\*\*[^*]+\*\*)/g);
  return chunks.map((chunk, index) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      const content = chunk.slice(2, -2);
      return (
        <strong
          key={`${content}-${index}`}
          className="rounded px-1 py-0.5 font-semibold bg-[var(--amber-fill)] text-[var(--amber-text)]"
        >
          {content}
        </strong>
      );
    }
    return <Fragment key={`${chunk}-${index}`}>{chunk}</Fragment>;
  });
}

function renderMarkdownLite(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith(">")) {
        const content = block.replace(/^>\s?/gm, "");
        return (
          <blockquote
            key={`quote-${index}`}
            className="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 py-2 pl-4 pr-4 my-4 rounded-r-lg text-[var(--text-primary)]"
          >
            {renderInlineFormatting(content)}
          </blockquote>
        );
      }

      if (block.startsWith("- ")) {
        const items = block
          .split("\n")
          .map((line) => line.replace(/^- /, "").trim())
          .filter(Boolean);
        return (
          <ul key={`ul-${index}`} className="list-disc list-inside space-y-1 text-[var(--text-primary)] mb-4">
            {items.map((item) => (
              <li key={item}>{renderInlineFormatting(item)}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={`p-${index}`} className="text-[var(--text-primary)] mb-4 leading-relaxed">
          {renderInlineFormatting(block)}
        </p>
      );
    });
}

interface LessonContentStepProps {
  title: string;
  body: string;
  onNext: () => void;
}

export function LessonContentStep({ title, body, onNext }: LessonContentStepProps) {
  const segments = splitMarkdownAndCharts(body);

  return (
    <div className="w-full max-w-3xl mx-auto pb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{title}</h2>
      <div className="max-w-none text-left space-y-1">
        {segments.map((seg, i) =>
          seg.type === "markdown" ? (
            <div key={i}>{renderMarkdownLite(seg.value)}</div>
          ) : (
            <ChartBlock key={i} src={seg.src} />
          )
        )}
      </div>
      <Button size="lg" onClick={onNext} className="w-full sm:w-auto mt-6 min-h-11 transition-all duration-200 hover:-translate-y-0.5">
        Continue
      </Button>
    </div>
  );
}
