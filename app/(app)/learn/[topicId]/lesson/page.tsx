import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";
import { LessonShell } from "@/components/learn/LessonShell";
import { buildLessonSteps1_1_1 } from "@/lib/lesson-1-1-1";
import { buildLessonSteps1_1_2 } from "@/lib/lesson-1-1-2";
import { buildLessonSteps1_1_3 } from "@/lib/lesson-1-1-3";

const TEXTBOOK_PATHS: Record<string, string> = {
  "1.1.1": join(process.cwd(), "textbook", "topic-1-1-1-what-is-money.md"),
  "1.1.2": join(process.cwd(), "textbook", "topic-1-1-2-needs-vs-wants.md"),
  "1.1.3": join(process.cwd(), "textbook", "topic-1-1-3-impulse-spending.md"),
};

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ redo?: string }>;
}) {
  const { topicId } = await params;
  const { redo } = await searchParams;
  const redoMode = redo === "1" || redo === "true";
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const progressRes = await supabase
    .from("user_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .single();

  if (progressRes.data?.status === "locked") redirect("/learn");

  // Topic 1.1.1 / 1.1.2 / 1.1.3: textbook-based lesson (aligned with /textbook/[topicId])
  if (topicId === "1.1.1" || topicId === "1.1.2" || topicId === "1.1.3") {
    const path = TEXTBOOK_PATHS[topicId];
    if (!path) notFound();
    let markdown: string;
    try {
      markdown = readFileSync(path, "utf-8");
    } catch {
      notFound();
    }
    const steps =
      topicId === "1.1.1"
        ? buildLessonSteps1_1_1(markdown)
        : topicId === "1.1.2"
          ? buildLessonSteps1_1_2(markdown)
          : buildLessonSteps1_1_3(markdown);
    if (steps.length === 0) notFound();
    return <LessonShell topicId={topicId} steps={steps} redoMode={redoMode} />;
  }

  // Other topics: load from Supabase
  const contentRes = await supabase
    .from("lesson_content")
    .select("content")
    .eq("topic_id", topicId)
    .eq("content_type", "duolingo_lesson")
    .single();

  if (!contentRes.data) notFound();

  const lesson = contentRes.data.content as { type: string; exercises: import("@/types/curriculum").LessonExercise[] };
  if (lesson?.type !== "duolingo_lesson" || !lesson.exercises?.length) notFound();

  return <LessonShell topicId={topicId} exercises={lesson.exercises} redoMode={redoMode} />;
}
