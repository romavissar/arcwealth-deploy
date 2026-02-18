"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLessonDescription, getLessonTitle } from "@/lib/curriculum";
import { Button } from "@/components/ui/button";

interface LessonNodeProps {
  topic: { topic_id: string; title: string; topic_type: string };
  status: "locked" | "available" | "in_progress" | "completed";
}

export function LessonNode({ topic, status }: LessonNodeProps) {
  const router = useRouter();
  const isLocked = status === "locked";
  const isLesson = topic.topic_type === "lesson";
  const href = isLocked ? undefined : isLesson ? `/learn/${topic.topic_id}/lesson` : `/learn/${topic.topic_id}`;
  const displayTitle = topic.topic_type === "lesson" ? getLessonTitle(topic.topic_id) : topic.title;
  const description =
    topic.topic_type === "lesson" || topic.topic_type === "checkpoint"
      ? getLessonDescription(topic.topic_id)
      : null;
  const isQuiz = topic.topic_type === "checkpoint" || topic.topic_type === "boss_challenge";
  const redoHref = isLesson
    ? `/learn/${topic.topic_id}/lesson?redo=1`
    : isQuiz
      ? `/learn/${topic.topic_id}/quiz?redo=1`
      : null;

  const cardClass = cn(
    "rounded-xl border-2 p-4 transition-all",
    status === "completed" && "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/30",
    status === "available" && "border-primary/40 bg-primary/5 dark:border-primary/50 dark:bg-primary/10",
    status === "in_progress" && "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/30 animate-pulse",
    status === "locked" && "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-75"
  );

  const inner = (
    <div className="flex items-start gap-3">
      {isLocked && <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 dark:text-gray-100">{displayTitle}</span>
          {status === "completed" && <span className="text-green-600 dark:text-green-400">✓</span>}
          {status === "completed" && redoHref && (
            <Button variant="ghost" size="sm" className="h-7 text-gray-600 dark:text-gray-400 shrink-0" asChild>
              <Link href={redoHref} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Redo (no XP)
              </Link>
            </Button>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-snug">{description}</p>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div title="Complete the previous lesson to unlock" className="mb-2">
        <div className={cardClass}>{inner}</div>
      </div>
    );
  }

  return (
    <div
      role="link"
      tabIndex={0}
      className={cn("mb-2 cursor-pointer hover:opacity-90", cardClass)}
      onClick={() => href && router.push(href)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && href) {
          e.preventDefault();
          router.push(href);
        }
      }}
    >
      {inner}
    </div>
  );
}
