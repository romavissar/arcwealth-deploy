"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import type { LessonTopic } from "@/lib/curriculum";

export type TextbookLessonTopic = LessonTopic & { hasReading: boolean; isCompleted: boolean };

export interface TopicSection {
  sectionNum: number;
  sectionName: string;
  topics: TextbookLessonTopic[];
}

export interface TopicGroup {
  topicNum: number;
  topicName: string;
  topicGoal: string;
  lessonsCount: number;
  readingsCount: number;
  sections: TopicSection[];
}

interface TextbookTopicAccordionProps {
  groups: TopicGroup[];
}

export function TextbookTopicAccordion({ groups }: TextbookTopicAccordionProps) {
  const [openTopic, setOpenTopic] = useState<number | null>(null);

  const toggle = (topicNum: number) => {
    setOpenTopic((prev) => (prev === topicNum ? null : topicNum));
  };

  return (
    <div className="space-y-4">
      {groups.map(({ topicNum, topicName, topicGoal, lessonsCount, readingsCount, sections }) => {
        const isOpen = openTopic === topicNum;
        return (
          <div
            key={topicNum}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-900/60"
          >
            <button
              type="button"
              onClick={() => toggle(topicNum)}
              className="w-full px-4 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/70 sm:px-5"
              aria-expanded={isOpen}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    Module {topicNum}
                  </div>
                  <h2 className="mt-1 text-lg font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-xl">{topicName}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{topicGoal}</p>
                </div>
                <div className="inline-flex w-fit shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left dark:border-gray-700 dark:bg-gray-800 sm:min-w-[6.5rem] sm:text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Coverage</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {readingsCount}/{lessonsCount}
                  </p>
                </div>
              </div>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-gray-200 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="space-y-6 p-4 md:p-5">
                    {sections.map(({ sectionNum, sectionName, topics }) => (
                      <div key={`${topicNum}-${sectionNum}`}>
                        <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">{sectionName}</h3>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {topics.map((t) => (
                            <li key={t.topic_id}>
                              <Link
                                href={`/textbook/${t.topic_id}`}
                                className={
                                  t.isCompleted
                                    ? "group block h-full rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-sm dark:border-emerald-700/70 dark:bg-emerald-950/30 dark:hover:border-emerald-500"
                                    : "group block h-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-slate-500"
                                }
                              >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="font-mono text-xs font-semibold text-primary">{t.topic_id}</span>
                                  <span
                                    className={
                                      t.isCompleted
                                        ? "rounded-full bg-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200"
                                        : t.hasReading
                                        ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                    }
                                  >
                                    {t.isCompleted ? "Complete" : t.hasReading ? "Ready" : "Curriculum draft"}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-slate-900 dark:text-gray-100 dark:group-hover:text-gray-100">
                                  {t.title}
                                </p>
                                {t.description && (
                                  <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-gray-600 dark:text-gray-300">
                                    {t.description}
                                  </p>
                                )}
                                <div className={t.isCompleted ? "mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300" : "mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-300"}>
                                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                                  Open lesson
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
