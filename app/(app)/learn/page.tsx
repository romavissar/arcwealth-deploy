import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { CurriculumMap } from "@/components/learn/CurriculumMap";

export default async function LearnPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServiceClient();
  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .order("order_index");
  const { data: progress } = await supabase
    .from("user_progress")
    .select("topic_id, status")
    .eq("user_id", userId);

  const progressMap = new Map((progress ?? []).map((p) => [p.topic_id, p.status as "locked" | "available" | "in_progress" | "completed"]));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your learning path</h1>
      <CurriculumMap topics={topics ?? []} progressMap={progressMap} />
    </div>
  );
}
