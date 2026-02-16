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
      <div className="max-w-3xl mx-auto pb-12 relative">
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
      <div className="max-w-3xl mx-auto pb-12 relative">
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
    <div className="max-w-3xl mx-auto pb-12 relative">
      <div className="absolute top-0 right-0">
        <Button asChild variant="ghost" size="lg">
          <Link href="/textbook">← All lessons</Link>
        </Button>
      </div>
      <article className="prose prose-gray max-w-none">
        <header className="mb-8">
          <p className="text-sm text-gray-500">
            Topic {levelNum} — {levelName} · Section {sectionNum} — {sectionName}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{topicTitle}</h1>
        </header>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
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
