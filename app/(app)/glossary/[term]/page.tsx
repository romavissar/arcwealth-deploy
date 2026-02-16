import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;
  const decoded = decodeURIComponent(term);
  const { userId } = await auth();

  const supabase = createServiceClient();
  const { data: row } = await supabase.from("glossary").select("term, definition, example, related_topic_ids").eq("term", decoded).single();
  if (!row) notFound();

  let unlocked = true;
  if (userId && row.related_topic_ids?.length) {
    const { data: progress } = await supabase.from("user_progress").select("topic_id, status").eq("user_id", userId);
    const map = new Map((progress ?? []).map((p) => [p.topic_id, p.status]));
    unlocked = row.related_topic_ids.some((id: string) => map.get(id) === "completed" || map.get(id) === "available" || map.get(id) === "in_progress");
  }

  if (!unlocked) {
    return (
      <div className="max-w-xl mx-auto rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">{row.term}</h1>
        <p className="text-gray-600 mb-4">
          Complete the lesson that introduces this term to unlock the definition.
        </p>
        <Link href="/learn" className="text-primary font-medium hover:underline">
          Go to Learn
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/glossary" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Glossary
      </Link>
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{row.term}</h1>
        <p className="text-gray-700 mb-6">{row.definition}</p>
        {row.example && (
          <p className="text-gray-600 italic border-l-4 border-primary/30 pl-4">
            &ldquo;{row.example}&rdquo;
          </p>
        )}
        {row.related_topic_ids?.length ? (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-2">Related topics</p>
            <div className="flex flex-wrap gap-2">
              {row.related_topic_ids.map((tid: string) => (
                <Link key={tid} href={`/learn/${tid}`} className="text-sm text-primary hover:underline">
                  {tid}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
