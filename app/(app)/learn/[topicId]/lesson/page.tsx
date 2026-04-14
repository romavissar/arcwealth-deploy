import { getAppUserId } from "@/lib/auth/server-user";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LessonShell } from "@/components/learn/LessonShell";
import type { LessonExercise, LessonContent } from "@/types/curriculum";

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
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const progressRes = await supabase
    .from("user_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .single();

  if (progressRes.data?.status === "locked") redirect("/learn");

  const [contentRes, profileRes] = await Promise.all([
    supabase.from("lesson_content").select("content").eq("topic_id", topicId).eq("content_type", "duolingo_lesson").single(),
    supabase.from("user_profiles").select("streak_days").eq("id", userId).single(),
  ]);

  if (!contentRes.data) notFound();

  const lesson = contentRes.data.content as LessonContent;
  if (lesson?.type !== "duolingo_lesson") notFound();
  const exercises = lesson.exercises as LessonExercise[] | undefined;
  if (!lesson.level && !exercises?.length) notFound();

  return (
    <LessonShell
      topicId={topicId}
      exercises={exercises}
      level={lesson.level}
      streakDays={profileRes.data?.streak_days ?? 0}
      redoMode={redoMode}
    />
  );
}
