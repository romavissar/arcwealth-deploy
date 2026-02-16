"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";

function isTermUnlocked(
  term: { related_topic_ids: string[] | null },
  progressMap: Map<string, string>
): boolean {
  const ids = term.related_topic_ids ?? [];
  if (ids.length === 0) return true;
  return ids.some((id) => progressMap.get(id) === "completed" || progressMap.get(id) === "available" || progressMap.get(id) === "in_progress");
}

export function GlossaryList({
  terms,
  progressMap,
}: {
  terms: { term: string; definition: string; example: string | null; related_topic_ids: string[] | null }[];
  progressMap: Map<string, string>;
}) {
  const [q, setQ] = useState("");
  const filtered = terms.filter((t) => t.term.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <Input
        placeholder="Search terms..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-6"
      />
      <ul className="space-y-3">
        {filtered.map((t) => {
          const unlocked = isTermUnlocked(t, progressMap);
          const firstTopic = (t.related_topic_ids ?? [])[0];
          return (
            <li key={t.term}>
              {unlocked ? (
                <Link
                  href={`/glossary/${encodeURIComponent(t.term)}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-primary/30"
                >
                  <p className="font-semibold text-gray-900">{t.term}</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{t.definition}</p>
                </Link>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-center gap-3 opacity-80">
                  <Lock className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-700">{t.term}</p>
                    <p className="text-xs text-gray-500">
                      Complete {firstTopic ?? "previous lessons"} to unlock
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
