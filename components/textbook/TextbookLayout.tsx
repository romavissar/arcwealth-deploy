"use client";

import Link from "next/link";
import { getSectionName, LEVEL_NAMES } from "@/lib/curriculum";
import type { TextbookContent } from "@/types/curriculum";

interface TextbookLayoutProps {
  content: TextbookContent;
  topicId: string;
  topicTitle: string;
}

export function TextbookLayout({ content, topicId, topicTitle }: TextbookLayoutProps) {
  const [levelNum, sectionNum] = topicId.split(".").map(Number);
  const levelName = LEVEL_NAMES[levelNum];
  const sectionName = getSectionName(levelNum, sectionNum);

  return (
    <article className="prose prose-gray max-w-none">
      <header className="mb-8">
        <p className="text-sm text-gray-500">
          Topic {levelNum} · {sectionName}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{topicTitle}</h1>
      </header>
      {content.sections.map((section, i) => (
        <section key={i} className="mb-8">
          {section.heading && (
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{section.heading}</h2>
          )}
          {section.blocks.map((block, j) => (
            <Block key={j} block={block} />
          ))}
        </section>
      ))}
      {content.key_takeaways?.length > 0 && (
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 mt-8">
          <h3 className="text-sm font-semibold text-primary mb-2">Key takeaways</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {content.key_takeaways.map((item, k) => (
              <li key={k}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function Block({
  block,
}: {
  block: TextbookContent["sections"][0]["blocks"][0];
}) {
  if (block.kind === "paragraph") {
    return <p className="text-gray-700 mb-4">{block.text}</p>;
  }
  if (block.kind === "key_concept") {
    return (
      <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4 my-4">
        <p className="font-semibold text-gray-900 mb-1">{block.title}</p>
        <p className="text-gray-700 text-sm">{block.body}</p>
      </div>
    );
  }
  if (block.kind === "real_world_example") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 my-4">
        <p className="font-semibold text-amber-800 mb-1">💡 {block.title}</p>
        <p className="text-gray-700 text-sm">{block.body}</p>
      </div>
    );
  }
  if (block.kind === "definition") {
    return (
      <p className="my-2">
        <Link href={`/glossary/${encodeURIComponent(block.term)}`} className="font-medium text-primary underline">
          {block.term}
        </Link>
        : {block.definition}
      </p>
    );
  }
  if (block.kind === "bullet_list") {
    return (
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.kind === "callout") {
    return (
      <div className="rounded-lg bg-gray-100 p-4 my-4 flex gap-2">
        <span>{block.icon}</span>
        <p className="text-gray-700 text-sm">{block.text}</p>
      </div>
    );
  }
  return null;
}
