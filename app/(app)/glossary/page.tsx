import { getAppUserId } from "@/lib/auth/server-user";
import { createServiceClient } from "@/lib/supabase/server";
import { GlossaryList } from "@/components/glossary/GlossaryList";
import { buildGlossaryFromCurrentTextbook } from "@/lib/glossary-from-textbook";

export default async function GlossaryPage() {
  const userId = await getAppUserId();
  const supabase = createServiceClient();
  const terms = await buildGlossaryFromCurrentTextbook(supabase);
  const progressMap = new Map<string, string>();
  if (userId) {
    const { data: progress } = await supabase.from("user_progress").select("topic_id, status").eq("user_id", userId);
    progress?.forEach((p) => progressMap.set(p.topic_id, p.status));
  }

  return (
    <div data-tour-id="glossary-overview" className="mx-auto max-w-4xl pb-12">
      <GlossaryList terms={terms} progressMap={progressMap} />
    </div>
  );
}
