import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VALID_LEARN_TOPIC_IDS } from "@/lib/curriculum";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const { data: progress } = await supabase
    .from("user_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .single();

  let status = progress?.status ?? "locked";
  if (status === "locked") {
    const { data: allTopics } = await supabase.from("topics").select("topic_id, order_index").order("order_index");
    const ordered = (allTopics ?? []).filter((t) => VALID_LEARN_TOPIC_IDS.has(t.topic_id));
    const idx = ordered.findIndex((t) => t.topic_id === topicId);
    if (idx > 0) {
      const prevTopicId = ordered[idx - 1].topic_id;
      const { data: prevProgress } = await supabase
        .from("user_progress")
        .select("status")
        .eq("user_id", userId)
        .eq("topic_id", prevTopicId)
        .single();
      if (prevProgress?.status === "completed") status = "available";
    }
    if (status === "locked") redirect("/learn");
  }

  const { data: topic } = await supabase
    .from("topics")
    .select("topic_type")
    .eq("topic_id", topicId)
    .single();

  if (topic?.topic_type === "checkpoint" || topic?.topic_type === "boss_challenge") {
    redirect(`/learn/${topicId}/quiz`);
  }

  if (topic?.topic_type === "lesson") {
    redirect(`/learn/${topicId}/lesson`);
  }

  redirect(`/textbook/${topicId}`);
}
