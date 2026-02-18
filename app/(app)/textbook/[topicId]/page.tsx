import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";
import { Button } from "@/components/ui/button";
import { TextbookLayout } from "@/components/textbook/TextbookLayout";
import { TextbookMarkdown } from "@/components/textbook/TextbookMarkdown";
import { getAllLessonTopics, getLessonTitle, getSectionName, LEVEL_NAMES } from "@/lib/curriculum";
import type { TextbookContent } from "@/types/curriculum";

const MARKDOWN_BY_TOPIC: Record<string, string> = {
  "1.1.1": "topic-1-1-1-what-is-money.md",
  "1.1.2": "topic-1-1-2-needs-vs-wants.md",
  "1.1.3": "topic-1-1-3-impulse-spending.md",
  "1.1.4": "topic-1-1-4-dopamine-rewards-spending.md",
  "1.1.5": "topic-1-1-5-delayed-gratification.md",
  "1.1.6": "topic-1-1-6-money-scripts-beliefs.md",
  "1.1.7": "topic-1-1-7-emotions-spending.md",
  "1.1.8": "topic-1-1-8-anchoring-pricing-psychology.md",
  "1.1.9": "topic-1-1-9-scarcity-abundance-mindset.md",
  "1.1.10": "topic-1-1-10-values-money.md",
  "1.1.11": "topic-1-1-11-financial-goals.md",
  "1.1.12": "topic-1-1-12-habits-build-wealth.md",
  "1.2.1": "topic-1-2-1-what-is-income.md",
  "1.2.2": "topic-1-2-2-salary-wages-paychecks.md",
  "1.2.3": "topic-1-2-3-net-vs-gross.md",
  "1.2.4": "topic-1-2-4-how-to-read-payslip.md",
};

const ALL_TOPICS = getAllLessonTopics();
const ALL_TOPIC_IDS = new Set(ALL_TOPICS.map((t) => t.topic_id));
const TOPIC_IDS_ORDERED = ALL_TOPICS.map((t) => t.topic_id);

export default async function TextbookTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  if (!ALL_TOPIC_IDS.has(topicId)) notFound();

  const currentIndex = TOPIC_IDS_ORDERED.indexOf(topicId);
  const prevTopicId = currentIndex > 0 ? TOPIC_IDS_ORDERED[currentIndex - 1] : null;
  const nextTopicId = currentIndex >= 0 && currentIndex < TOPIC_IDS_ORDERED.length - 1 ? TOPIC_IDS_ORDERED[currentIndex + 1] : null;

  const [levelNum, sectionNum] = topicId.split(".").map(Number);
  const levelName = LEVEL_NAMES[levelNum] ?? `Topic ${levelNum}`;
  const sectionName = getSectionName(levelNum, sectionNum);

  const supabase = createServiceClient();
  const [topicRes, contentRes] = await Promise.all([
    supabase.from("topics").select("title, level_number, section_number").eq("topic_id", topicId).single(),
    topicId in MARKDOWN_BY_TOPIC
      ? Promise.resolve({ data: null })
      : supabase.from("lesson_content").select("content").eq("topic_id", topicId).eq("content_type", "textbook").single(),
  ]);

  const topicTitle = getLessonTitle(topicId);

  if (topicId in MARKDOWN_BY_TOPIC) {
    const filename = MARKDOWN_BY_TOPIC[topicId as keyof typeof MARKDOWN_BY_TOPIC];
    let markdown: string;
    try {
      markdown = readFileSync(join(process.cwd(), "textbook", filename), "utf-8");
    } catch {
      notFound();
    }
    const firstLine = markdown.split("\n")[0] ?? "";
    const titleMatch = firstLine.match(/^#\s*(?:Topic\s+[\d.]+\s*—\s*)?(.+)$/);
    const displayTitle = titleMatch ? titleMatch[1].trim() : topicTitle;
    const markdownBody = markdown.replace(/^#\s*[^\n]+\n+/, "").trim();
    return (
      <div className="max-w-3xl mx-auto pb-12 relative text-gray-900 dark:text-gray-100">
        <div className="absolute top-0 right-0">
          <Button asChild variant="ghost" size="lg">
            <Link href="/textbook">← All lessons</Link>
          </Button>
        </div>
        <TextbookMarkdown
          markdown={markdownBody}
          topicId={topicId}
          topicTitle={displayTitle}
          levelName={`Topic ${levelNum} — ${levelName}`}
          sectionName={`Section ${sectionNum} — ${sectionName}`}
        />
        <div className="mt-8 flex gap-4 justify-center flex-wrap items-center">
          {prevTopicId && (
            <Button asChild variant="outline" size="lg">
              <Link href={`/textbook/${prevTopicId}`}>← Previous Lesson</Link>
            </Button>
          )}
          <Button asChild size="lg">
            <Link href={`/learn/${topicId}/lesson`}>Start lesson</Link>
          </Button>
          {nextTopicId && (
            <Button asChild variant="outline" size="lg">
              <Link href={`/textbook/${nextTopicId}`}>Next Lesson →</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (contentRes.data) {
    const content = (contentRes.data as { content: TextbookContent }).content;
    return (
      <div className="max-w-3xl mx-auto pb-12 relative text-gray-900 dark:text-gray-100">
        <div className="absolute top-0 right-0">
          <Button asChild variant="ghost" size="lg">
            <Link href="/textbook">← All lessons</Link>
          </Button>
        </div>
        <TextbookLayout content={content} topicId={topicId} topicTitle={topicTitle} />
        <div className="mt-8 flex gap-4 justify-center flex-wrap items-center">
          {prevTopicId && (
            <Button asChild variant="outline" size="lg">
              <Link href={`/textbook/${prevTopicId}`}>← Previous Lesson</Link>
            </Button>
          )}
          <Button asChild size="lg">
            <Link href={`/learn/${topicId}/lesson`}>Start lesson</Link>
          </Button>
          {nextTopicId && (
            <Button asChild variant="outline" size="lg">
              <Link href={`/textbook/${nextTopicId}`}>Next Lesson →</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 relative text-gray-900 dark:text-gray-100">
      <div className="absolute top-0 right-0">
        <Button asChild variant="ghost" size="lg">
          <Link href="/textbook">← All lessons</Link>
        </Button>
      </div>
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <header className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Topic {levelNum} — {levelName} · Section {sectionNum} — {sectionName}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{topicTitle}</h1>
        </header>
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="font-medium">Textbook content coming soon</p>
          <p className="text-sm mt-2">This lesson&apos;s reading material is not yet available.</p>
        </div>
      </article>
      <div className="mt-8 flex gap-4 justify-center flex-wrap items-center">
        {prevTopicId && (
          <Button asChild variant="outline" size="lg">
            <Link href={`/textbook/${prevTopicId}`}>← Previous Lesson</Link>
          </Button>
        )}
        {nextTopicId && (
          <Button asChild variant="outline" size="lg">
            <Link href={`/textbook/${nextTopicId}`}>Next Lesson →</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
