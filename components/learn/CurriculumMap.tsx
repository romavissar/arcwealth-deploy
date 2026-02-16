"use client";

import { LessonNode } from "./LessonNode";
import { getSectionName, LEVEL_NAMES } from "@/lib/curriculum";
import type { Topic } from "@/types/curriculum";

type TopicRow = Topic & { topic_id: string; topic_type: string; order_index: number };

interface CurriculumMapProps {
  topics: TopicRow[];
  progressMap: Map<string, "locked" | "available" | "in_progress" | "completed">;
}

export function CurriculumMap({ topics, progressMap }: CurriculumMapProps) {
  let currentLevel = 0;
  let currentSection = 0;

  return (
    <div className="space-y-6 pb-12">
      {topics.map((topic) => {
        const status = progressMap.get(topic.topic_id) ?? "locked";
        const isLevelStart = topic.level_number !== currentLevel;
        const isSectionStart = topic.section_number !== currentSection;
        if (isLevelStart) currentLevel = topic.level_number;
        if (isSectionStart) currentSection = topic.section_number;

        return (
          <div key={topic.topic_id} className="mb-3">
            {isLevelStart && (
              <div className="rounded-lg bg-primary/10 dark:bg-primary/20 text-primary font-semibold px-4 py-2 mb-4">
                Topic {topic.level_number} — {LEVEL_NAMES[topic.level_number as keyof typeof LEVEL_NAMES] ?? "Unknown"}
              </div>
            )}
            {isSectionStart && (
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
                {getSectionName(topic.level_number, topic.section_number)}
              </div>
            )}
            <LessonNode topic={topic} status={status} />
          </div>
        );
      })}
    </div>
  );
}
