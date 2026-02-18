import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { CurriculumMap } from "@/components/learn/CurriculumMap";
import { VALID_LEARN_TOPIC_IDS } from "@/lib/curriculum";

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

  // Only show topics that exist in the curriculum (hides stale DB rows like "Lesson 13")
  const filteredTopics = (topics ?? []).filter((t) => VALID_LEARN_TOPIC_IDS.has(t.topic_id));

  // If the previous topic is completed, treat the next as available (fixes users who completed checkpoint before unlock logic)
  const effectiveMap = new Map(progressMap);
  for (let i = 1; i < filteredTopics.length; i++) {
    const prevTopic = filteredTopics[i - 1];
    const currTopic = filteredTopics[i];
    const currStatus = effectiveMap.get(currTopic.topic_id);
    if ((currStatus === undefined || currStatus === "locked") && effectiveMap.get(prevTopic.topic_id) === "completed") {
      effectiveMap.set(currTopic.topic_id, "available");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your learning path</h1>
      <CurriculumMap topics={filteredTopics} progressMap={effectiveMap} />
    </div>
  );
}
