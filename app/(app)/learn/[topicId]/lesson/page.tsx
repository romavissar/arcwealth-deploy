import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";
import { LessonShell } from "@/components/learn/LessonShell";
import { buildLessonSteps1_1_1 } from "@/lib/lesson-1-1-1";
import { buildLessonSteps1_1_2 } from "@/lib/lesson-1-1-2";
import { buildLessonSteps1_1_3 } from "@/lib/lesson-1-1-3";
import { buildLessonSteps1_1_4 } from "@/lib/lesson-1-1-4";
import { buildLessonSteps1_1_5 } from "@/lib/lesson-1-1-5";
import { buildLessonSteps1_1_6 } from "@/lib/lesson-1-1-6";
import { buildLessonSteps1_1_7 } from "@/lib/lesson-1-1-7";
import { buildLessonSteps1_1_8 } from "@/lib/lesson-1-1-8";
import { buildLessonSteps1_1_9 } from "@/lib/lesson-1-1-9";
import { buildLessonSteps1_1_10 } from "@/lib/lesson-1-1-10";
import { buildLessonSteps1_1_11 } from "@/lib/lesson-1-1-11";
import { buildLessonSteps1_1_12 } from "@/lib/lesson-1-1-12";

const TEXTBOOK_PATHS: Record<string, string> = {
  "1.1.1": join(process.cwd(), "textbook", "topic-1-1-1-what-is-money.md"),
  "1.1.2": join(process.cwd(), "textbook", "topic-1-1-2-needs-vs-wants.md"),
  "1.1.3": join(process.cwd(), "textbook", "topic-1-1-3-impulse-spending.md"),
  "1.1.4": join(process.cwd(), "textbook", "topic-1-1-4-dopamine-rewards-spending.md"),
  "1.1.5": join(process.cwd(), "textbook", "topic-1-1-5-delayed-gratification.md"),
  "1.1.6": join(process.cwd(), "textbook", "topic-1-1-6-money-scripts-beliefs.md"),
  "1.1.7": join(process.cwd(), "textbook", "topic-1-1-7-emotions-spending.md"),
  "1.1.8": join(process.cwd(), "textbook", "topic-1-1-8-anchoring-pricing-psychology.md"),
  "1.1.9": join(process.cwd(), "textbook", "topic-1-1-9-scarcity-abundance-mindset.md"),
  "1.1.10": join(process.cwd(), "textbook", "topic-1-1-10-values-money.md"),
  "1.1.11": join(process.cwd(), "textbook", "topic-1-1-11-financial-goals.md"),
  "1.1.12": join(process.cwd(), "textbook", "topic-1-1-12-habits-build-wealth.md"),
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

  // Topic 1.1.1–1.1.12: textbook-based lesson (aligned with /textbook/[topicId])
  if (topicId === "1.1.1" || topicId === "1.1.2" || topicId === "1.1.3" || topicId === "1.1.4" || topicId === "1.1.5" || topicId === "1.1.6" || topicId === "1.1.7" || topicId === "1.1.8" || topicId === "1.1.9" || topicId === "1.1.10" || topicId === "1.1.11" || topicId === "1.1.12") {
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
          : topicId === "1.1.3"
            ? buildLessonSteps1_1_3(markdown)
            : topicId === "1.1.4"
              ? buildLessonSteps1_1_4(markdown)
              : topicId === "1.1.5"
                ? buildLessonSteps1_1_5(markdown)
                : topicId === "1.1.6"
                  ? buildLessonSteps1_1_6(markdown)
                  : topicId === "1.1.7"
                    ? buildLessonSteps1_1_7(markdown)
                    : topicId === "1.1.8"
                      ? buildLessonSteps1_1_8(markdown)
                      : topicId === "1.1.9"
                        ? buildLessonSteps1_1_9(markdown)
                        : topicId === "1.1.10"
                          ? buildLessonSteps1_1_10(markdown)
                          : topicId === "1.1.11"
                            ? buildLessonSteps1_1_11(markdown)
                            : buildLessonSteps1_1_12(markdown);
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
