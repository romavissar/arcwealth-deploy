"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { completeLesson, decrementHeart } from "@/app/actions/progress";

interface ResultsScreenProps {
  topicId: string;
  xpEarned: number;
  totalExercises: number;
  wrongCount: number;
  redoMode?: boolean;
  onContinue: () => void;
}

export function ResultsScreen({ topicId, xpEarned, totalExercises, wrongCount, redoMode = false, onContinue }: ResultsScreenProps) {
  const perfect = wrongCount === 0;
  const correctPct = totalExercises > 0 ? (totalExercises - wrongCount) / totalExercises : 1;
  const passed = correctPct >= 0.7;
  const loseHeart = totalExercises > 0 && correctPct < 0.7;
  const heartDecrementedRef = useRef(false);
  const lessonCompletedRef = useRef(false);

  useEffect(() => {
    if (passed && !lessonCompletedRef.current) {
      lessonCompletedRef.current = true;
      completeLesson(topicId, xpEarned, redoMode).catch(() => {});
    }
  }, [passed, topicId, xpEarned, redoMode]);

  useEffect(() => {
    if (loseHeart && !heartDecrementedRef.current) {
      heartDecrementedRef.current = true;
      decrementHeart().catch(() => {});
    }
  }, [loseHeart]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 z-50 p-6">
      <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-600 p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Lesson complete!</h2>
        <p className="text-primary font-semibold text-xl mb-6">{redoMode ? "Redo complete — no XP" : `+${xpEarned} XP`}</p>
        {perfect ? (
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You finished {totalExercises} exercise{totalExercises !== 1 ? "s" : ""} with no mistakes. Keep it up!
          </p>
        ) : passed ? (
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You had {wrongCount} mistake{wrongCount !== 1 ? "s" : ""}. Lesson marked complete — next one unlocked!
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You had {wrongCount} mistake{wrongCount !== 1 ? "s" : ""}. Get at least 70% correct to mark the lesson
            complete and unlock the next.
          </p>
        )}
        {loseHeart && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-4">Below 70% — one heart lost.</p>
        )}
        <Button size="lg" className="w-full" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
