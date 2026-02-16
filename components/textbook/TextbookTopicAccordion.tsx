"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { LessonTopic } from "@/lib/curriculum";

export interface TopicSection {
  sectionNum: number;
  sectionName: string;
  topics: LessonTopic[];
}

export interface TopicGroup {
  topicNum: number;
  topicName: string;
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
    <div className="space-y-1">
      {groups.map(({ topicNum, topicName, sections }) => {
        const isOpen = openTopic === topicNum;
        return (
          <div
            key={topicNum}
            className="rounded-lg border border-gray-200 bg-white overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(topicNum)}
              className="w-full flex items-center gap-2 text-left px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500 shrink-0" />
              )}
              Topic {topicNum} — {topicName}
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-gray-200 bg-gray-50/50">
                  <div className="p-4 space-y-6">
                    {sections.map(({ sectionNum, sectionName, topics }) => (
                      <div key={`${topicNum}-${sectionNum}`}>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">{sectionName}</h3>
                        <ul className="space-y-3">
                          {topics.map((t) => (
                            <li key={t.topic_id}>
                              <Link
                                href={`/textbook/${t.topic_id}`}
                                className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-primary/30 hover:bg-primary/5 transition-colors"
                              >
                                <span className="font-mono text-sm text-primary">{t.topic_id}</span>
                                <span className="ml-2 font-medium text-gray-900">{t.title}</span>
                                {t.description && (
                                  <p className="mt-1.5 text-sm text-gray-600 leading-snug">
                                    {t.description}
                                  </p>
                                )}
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
