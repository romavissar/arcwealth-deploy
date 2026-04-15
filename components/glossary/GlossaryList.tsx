"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LEVEL_NAMES } from "@/lib/curriculum";

function isTermUnlocked(
  term: { related_topic_ids: string[] | null },
  progressMap: Map<string, string>
): boolean {
  const ids = term.related_topic_ids ?? [];
  if (ids.length === 0) return true;
  return ids.some((id) => progressMap.get(id) === "completed" || progressMap.get(id) === "available" || progressMap.get(id) === "in_progress");
}

type FilterState = "all" | "unlocked" | "locked";

function getModuleIdsForTerm(relatedTopicIds: string[] | null): number[] {
  if (!relatedTopicIds?.length) return [];
  return Array.from(
    new Set(
      relatedTopicIds
        .map((topicId) => Number(topicId.split(".")[0]))
        .filter((value) => Number.isFinite(value) && value > 0)
    )
  );
}

export function GlossaryList({
  terms,
  progressMap,
}: {
  terms: { term: string; definition: string; example: string | null; related_topic_ids: string[] | null }[];
  progressMap: Map<string, string>;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterState>("all");
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  const totalCount = terms.length;
  const unlockedCount = terms.filter((term) => isTermUnlocked(term, progressMap)).length;
  const lockedCount = totalCount - unlockedCount;

  const availableModules = Array.from(
    new Set(
      terms.flatMap((term) =>
        (term.related_topic_ids ?? [])
          .map((topicId) => Number(topicId.split(".")[0]))
          .filter((value) => Number.isFinite(value) && value > 0)
      )
    )
  ).sort((a, b) => a - b);

  const normalizedQuery = q.trim().toLowerCase();
  const filtered = terms.filter((term) => {
    const unlocked = isTermUnlocked(term, progressMap);
    if (filter === "unlocked" && !unlocked) return false;
    if (filter === "locked" && unlocked) return false;

    if (selectedModule !== null) {
      const moduleIds = getModuleIdsForTerm(term.related_topic_ids);
      if (!moduleIds.includes(selectedModule)) return false;
    }

    if (!normalizedQuery) return true;
    return (
      term.term.toLowerCase().includes(normalizedQuery) ||
      term.definition.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Lesson vocabulary</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Glossary</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300">
              Terms are generated from the current textbook lessons so the glossary stays aligned with the curriculum.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            {totalCount} terms
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Unlocked</p>
            <p className="mt-1 text-xl font-bold text-emerald-900 dark:text-emerald-100">{unlockedCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Locked</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{lockedCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by term or definition..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            aria-label="Search glossary terms"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "unlocked", "locked"] as const).map((option) => {
            const isActive = filter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`min-h-11 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {option === "all" ? "All terms" : option === "unlocked" ? "Unlocked" : "Locked"}
              </button>
            );
          })}
        </div>
        {availableModules.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedModule(null)}
              className={`min-h-11 rounded-full px-3 py-2 text-sm font-medium transition ${
                selectedModule === null
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/70"
              }`}
            >
              All modules
            </button>
            {availableModules.map((moduleId) => {
              const isActive = selectedModule === moduleId;
              return (
                <button
                  key={moduleId}
                  type="button"
                  onClick={() => setSelectedModule(moduleId)}
                  className={`min-h-11 rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/70"
                  }`}
                >
                  {LEVEL_NAMES[moduleId] ?? `Module ${moduleId}`}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No terms match your filters</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Try a different keyword or clear a filter.</p>
        </div>
      ) : null}

      <ul className="space-y-3">
        {filtered.map((t) => {
          const unlocked = isTermUnlocked(t, progressMap);
          const firstTopic = (t.related_topic_ids ?? [])[0];
          const moduleNames = getModuleIdsForTerm(t.related_topic_ids).map((moduleId) => LEVEL_NAMES[moduleId] ?? `Module ${moduleId}`);
          return (
            <li key={t.term}>
              {unlocked ? (
                <Link
                  href={`/glossary/${encodeURIComponent(t.term)}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/60 dark:hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{t.term}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Unlocked
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{t.definition}</p>
                  {moduleNames.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {moduleNames.map((module) => (
                        <span
                          key={`${t.term}-${module}`}
                          className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 opacity-90 dark:border-gray-700 dark:bg-gray-900/60">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{t.term}</p>
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          Locked
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Complete {firstTopic ?? "previous lessons"} to unlock this definition.
                      </p>
                    </div>
                  </div>
                  {moduleNames.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {moduleNames.map((module) => (
                        <span
                          key={`${t.term}-${module}`}
                          className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
