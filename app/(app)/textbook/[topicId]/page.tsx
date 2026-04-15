import { getAppUserId } from "@/lib/auth/server-user";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextbookLayout } from "@/components/textbook/TextbookLayout";
import { SimpleTextbookMarkdown } from "@/components/textbook/SimpleTextbookMarkdown";
import { getLessonDescription, getLessonTitle, getSectionName, LEVEL_GOALS, LEVEL_NAMES } from "@/lib/curriculum";
import type { TextbookContent } from "@/types/curriculum";
import { loadMarkdownTextbookLessons } from "@/lib/textbook-markdown";
import { TextbookLessonActions } from "@/components/textbook/TextbookLessonActions";

const DEFAULT_READING_TIME_MINUTES = 5;

function getEstimatedReadingMinutes(markdown: string | null | undefined): number {
  if (!markdown) return DEFAULT_READING_TIME_MINUTES;
  const explicitMinutes = markdown.match(/Reading time:\s*~?\s*(\d+)\s*minute/i)?.[1];
  const parsed = explicitMinutes ? Number(explicitMinutes) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_READING_TIME_MINUTES;
  return parsed;
}

export default async function TextbookTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const [{ data: allTopics }, markdownLessons] = await Promise.all([
    supabase.from("topics").select("topic_id").order("order_index"),
    loadMarkdownTextbookLessons(),
  ]);
  const markdownByTopicId = new Map(markdownLessons.map((lesson) => [lesson.topicId, lesson]));
  const TOPIC_IDS_ORDERED = Array.from(
    new Set([...(allTopics ?? []).map((t) => t.topic_id), ...markdownLessons.map((lesson) => lesson.topicId)])
  );
  if (!TOPIC_IDS_ORDERED.includes(topicId)) notFound();

  const currentIndex = TOPIC_IDS_ORDERED.indexOf(topicId);
  const prevTopicId = currentIndex > 0 ? TOPIC_IDS_ORDERED[currentIndex - 1] : null;
  const nextTopicId = currentIndex >= 0 && currentIndex < TOPIC_IDS_ORDERED.length - 1 ? TOPIC_IDS_ORDERED[currentIndex + 1] : null;

  const [levelNum, sectionNum] = topicId.split(".").map(Number);
  const levelName = LEVEL_NAMES[levelNum] ?? `Topic ${levelNum}`;
  const sectionName = getSectionName(levelNum, sectionNum);

  const [topicRes, contentRes, textbookProgressRes] = await Promise.all([
    supabase.from("topics").select("title, level_number, section_number").eq("topic_id", topicId).single(),
    supabase.from("lesson_content").select("content").eq("topic_id", topicId).eq("content_type", "textbook").single(),
    supabase.from("user_textbook_progress").select("topic_id").eq("user_id", userId).eq("topic_id", topicId),
  ]);
  const markdownLesson = markdownByTopicId.get(topicId);

  // Keep textbook titles aligned with curriculum naming from the draft PDF.
  const topicTitle = getLessonTitle(topicId);
  const topicMeta = `Topic ${levelNum} — ${levelName}`;
  const sectionMeta = `Section ${sectionNum} — ${sectionName}`;
  const curriculumDescription = getLessonDescription(topicId);
  const levelGoal = LEVEL_GOALS[levelNum];
  const textbookProgressRows = textbookProgressRes.data ?? [];
  const isTextbookCompleted = textbookProgressRows.length > 0;
  const estimatedReadingMinutes = getEstimatedReadingMinutes(markdownLesson?.markdown);

  if (contentRes.data?.content) {
    const content = (contentRes.data as { content: TextbookContent }).content;
    return (
      <div className="mx-auto max-w-4xl pb-12 text-gray-900 dark:text-gray-100">
        <header className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-cyan-300">
                {topicMeta}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {sectionMeta}
              </span>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
              <Link href="/textbook">← All lessons</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">{topicTitle}</h1>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <TextbookLayout content={content} topicId={topicId} topicTitle={topicTitle} />
        </div>
        <TextbookLessonActions
          topicId={topicId}
          prevTopicId={prevTopicId}
          nextTopicId={nextTopicId}
          showStartLesson
          estimatedReadingMinutes={estimatedReadingMinutes}
          initiallyCompleted={isTextbookCompleted}
        />
      </div>
    );
  }

  if (markdownLesson) {
    return (
      <div className="mx-auto max-w-4xl pb-12 text-gray-900 dark:text-gray-100">
        <header className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-cyan-300">
                {topicMeta}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {sectionMeta}
              </span>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
              <Link href="/textbook">← All lessons</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">{topicTitle}</h1>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <SimpleTextbookMarkdown markdown={markdownLesson.markdown} />
        </div>
        <TextbookLessonActions
          topicId={topicId}
          prevTopicId={prevTopicId}
          nextTopicId={nextTopicId}
          showStartLesson={Boolean(topicRes.data)}
          estimatedReadingMinutes={estimatedReadingMinutes}
          initiallyCompleted={isTextbookCompleted}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-12 text-gray-900 dark:text-gray-100">
      <header className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-cyan-300">
              {topicMeta}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {sectionMeta}
            </span>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
            <Link href="/textbook">← All lessons</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">{topicTitle}</h1>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Curriculum-aligned lesson brief</p>
        <p className="mt-2 text-[1.05rem] leading-7 text-slate-700 dark:text-slate-300">
          {curriculumDescription ??
            "This lesson slot is in the curriculum and is awaiting a full textbook article. The learning pathway and sequencing are already aligned."}
        </p>
        {levelGoal && (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800/80 dark:bg-indigo-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Module goal</p>
            <p className="mt-1 text-sm text-indigo-900 dark:text-indigo-100">{levelGoal}</p>
          </div>
        )}
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            This brief is sourced from the ArcWealth draft curriculum so lesson intent stays consistent while full reading content is being expanded.
          </p>
        </div>
      </section>

      <TextbookLessonActions
        topicId={topicId}
        prevTopicId={prevTopicId}
        nextTopicId={nextTopicId}
        showStartLesson={Boolean(topicRes.data)}
        estimatedReadingMinutes={estimatedReadingMinutes}
        initiallyCompleted={isTextbookCompleted}
      />
    </div>
  );
}
