"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLessonDescription, getLessonTitle } from "@/lib/curriculum";

interface LessonNodeProps {
  topic: { topic_id: string; title: string; topic_type: string };
  status: "locked" | "available" | "in_progress" | "completed";
}

export function LessonNode({ topic, status }: LessonNodeProps) {
  const isLocked = status === "locked";
  const href = isLocked ? "#" : `/learn/${topic.topic_id}`;
  const displayTitle = topic.topic_type === "lesson" ? getLessonTitle(topic.topic_id) : topic.title;
  const description = topic.topic_type === "lesson" ? getLessonDescription(topic.topic_id) : null;

  const wrapper = (
    <div
      className={cn(
        "rounded-xl border-2 p-4 transition-all",
        status === "completed" && "border-green-300 bg-green-50",
        status === "available" && "border-primary/40 bg-primary/5",
        status === "in_progress" && "border-amber-400 bg-amber-50 animate-pulse",
        status === "locked" && "border-gray-200 bg-gray-50 opacity-75"
      )}
    >
      <div className="flex items-start gap-3">
        {isLocked && <Lock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{displayTitle}</span>
            {status === "completed" && <span className="text-green-600">✓</span>}
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-600 leading-snug">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div title="Complete the previous lesson to unlock" className="mb-2">
        {wrapper}
      </div>
    );
  }

  return (
    <Link href={href} className="block mb-2 hover:opacity-90">
      {wrapper}
    </Link>
  );
}
