"use client";

import { SimpleTextbookMarkdown } from "./SimpleTextbookMarkdown";

interface TextbookMarkdownProps {
  markdown: string;
  topicId: string;
  topicTitle: string;
  levelName?: string;
  sectionName?: string;
}

export function TextbookMarkdown({
  markdown,
  topicId,
  topicTitle,
  levelName = "Topic 1",
  sectionName = "Money Psychology",
}: TextbookMarkdownProps) {
  return (
    <article className="max-w-none">
      <header className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {levelName} · {sectionName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Topic {topicId} — {topicTitle}
        </h1>
      </header>
      <SimpleTextbookMarkdown markdown={markdown} />
    </article>
  );
}
