import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { GlossaryList } from "@/components/glossary/GlossaryList";

export default async function GlossaryPage() {
  const { userId } = await auth();
  const supabase = createServiceClient();
  const { data: terms } = await supabase.from("glossary").select("term, definition, example, related_topic_ids").order("term");
  const progressMap = new Map<string, string>();
  if (userId) {
    const { data: progress } = await supabase.from("user_progress").select("topic_id, status").eq("user_id", userId);
    progress?.forEach((p) => progressMap.set(p.topic_id, p.status));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Glossary</h1>
      <GlossaryList terms={terms ?? []} progressMap={progressMap} />
    </div>
  );
}
