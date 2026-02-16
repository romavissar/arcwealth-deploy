"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { completeLesson } from "@/app/actions/progress";

interface ResultsScreenProps {
  topicId: string;
  xpEarned: number;
  totalExercises: number;
  onContinue: () => void;
}

export function ResultsScreen({ topicId, xpEarned, totalExercises, onContinue }: ResultsScreenProps) {
  useEffect(() => {
    completeLesson(topicId, xpEarned).catch(() => {});
  }, [topicId, xpEarned]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 z-50 p-6">
      <div className="rounded-2xl bg-white shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson complete!</h2>
        <p className="text-primary font-semibold text-xl mb-6">+{xpEarned} XP</p>
        <p className="text-gray-600 mb-8">
          You finished {totalExercises} exercise{totalExercises !== 1 ? "s" : ""}. Keep it up!
        </p>
        <Button size="lg" className="w-full" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
