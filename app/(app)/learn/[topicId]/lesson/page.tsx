import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LessonShell } from "@/components/learn/LessonShell";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const [progressRes, contentRes] = await Promise.all([
    supabase.from("user_progress").select("status").eq("user_id", userId).eq("topic_id", topicId).single(),
    supabase.from("lesson_content").select("content").eq("topic_id", topicId).eq("content_type", "duolingo_lesson").single(),
  ]);

  if (progressRes.data?.status === "locked") redirect("/learn");
  if (!contentRes.data) notFound();

  const lesson = contentRes.data.content as { type: string; exercises: import("@/types/curriculum").LessonExercise[] };
  if (lesson?.type !== "duolingo_lesson" || !lesson.exercises?.length) notFound();

  return (
    <LessonShell topicId={topicId} exercises={lesson.exercises} />
  );
}
