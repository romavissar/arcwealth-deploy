"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { setTextbookLessonCompletion } from "@/app/actions/progress";

interface TextbookLessonActionsProps {
  topicId: string;
  prevTopicId: string | null;
  nextTopicId: string | null;
  showStartLesson: boolean;
  estimatedReadingMinutes: number;
  initiallyCompleted: boolean;
}

export function TextbookLessonActions({
  topicId,
  prevTopicId,
  nextTopicId,
  showStartLesson,
  estimatedReadingMinutes,
  initiallyCompleted,
}: TextbookLessonActionsProps) {
  const [isCompleted, setIsCompleted] = useState(initiallyCompleted);
  const [activeReadingMs, setActiveReadingMs] = useState(0);
  const [isPending, startTransition] = useTransition();
  const autoCompletedRef = useRef(initiallyCompleted);

  const effectiveReadingMinutes = Math.max(1, estimatedReadingMinutes);
  const targetReadingMs = effectiveReadingMinutes * 60 * 1000;

  useEffect(() => {
    if (isCompleted) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveReadingMs((prev) => prev + 1000);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isCompleted]);

  useEffect(() => {
    if (isCompleted || autoCompletedRef.current) return;
    if (activeReadingMs < targetReadingMs) return;

    autoCompletedRef.current = true;
    startTransition(async () => {
      const result = await setTextbookLessonCompletion(topicId, true);
      if (!result.error) setIsCompleted(true);
    });
  }, [activeReadingMs, isCompleted, targetReadingMs, topicId]);

  const handleCompletionToggle = () => {
    if (isPending) return;
    const nextCompleted = !isCompleted;
    startTransition(async () => {
      const result = await setTextbookLessonCompletion(topicId, nextCompleted);
      if (!result.error) {
        setIsCompleted(nextCompleted);
        if (!nextCompleted) {
          // Uncompleting should restore manual control instead of instant re-auto-complete.
          setActiveReadingMs(0);
          autoCompletedRef.current = false;
        }
      }
    });
  };

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {prevTopicId && (
        <Button asChild variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
          <Link href={`/textbook/${prevTopicId}`}>← Previous Lesson</Link>
        </Button>
      )}

      {showStartLesson && (
        <Button asChild size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
          <Link href={`/learn/${topicId}/lesson`}>Start lesson</Link>
        </Button>
      )}

      <Button
        type="button"
        size="lg"
        onClick={handleCompletionToggle}
        aria-pressed={isCompleted}
        disabled={isPending}
        className={
          isCompleted
            ? "bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-600"
            : "bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
        }
      >
        {isPending ? "Updating..." : isCompleted ? "Completed" : "Complete"}
      </Button>

      {nextTopicId && (
        <Button asChild variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
          <Link href={`/textbook/${nextTopicId}`}>Next Lesson →</Link>
        </Button>
      )}
    </div>
  );
}
