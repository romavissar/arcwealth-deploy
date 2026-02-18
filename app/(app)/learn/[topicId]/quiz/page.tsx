import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuizPageClient } from "@/components/learn/QuizPageClient";
import type { LessonExercise } from "@/types/curriculum";
import { CHECKPOINT_1_1_EXERCISES } from "@/lib/checkpoint-1-1";

export default async function QuizPage({
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
  const [progressRes, contentRes, topicRes] = await Promise.all([
    supabase.from("user_progress").select("status").eq("user_id", userId).eq("topic_id", topicId).single(),
    supabase.from("lesson_content").select("content").eq("topic_id", topicId).eq("content_type", "quiz").single(),
    supabase.from("topics").select("topic_type, xp_reward").eq("topic_id", topicId).single(),
  ]);

  if (progressRes.data?.status === "locked") redirect("/learn");

  // Checkpoint 1.1: questions-only quiz from code (covers 1.1.1–1.1.12)
  let exercises: LessonExercise[];
  if (topicId === "1.1.checkpoint") {
    exercises = CHECKPOINT_1_1_EXERCISES;
  } else {
    const content = contentRes.data?.content ?? contentRes.data ?? (await supabase.from("lesson_content").select("content").eq("topic_id", topicId).eq("content_type", "duolingo_lesson").single()).data?.content;
    if (!content || !(content as { exercises?: LessonExercise[] }).exercises) notFound();
    exercises = (content as { exercises: LessonExercise[] }).exercises;
  }

  const topic = topicRes.data;
  const xpReward = topic?.xp_reward ?? 25;
  const isCheckpoint = topic?.topic_type === "checkpoint";

  return (
    <QuizPageClient
      topicId={topicId}
      exercises={exercises}
      xpReward={xpReward}
      isBoss={topic?.topic_type === "boss_challenge"}
      isCheckpoint={isCheckpoint}
      redoMode={redoMode}
    />
  );
}
