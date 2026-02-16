"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { HeartDisplay } from "@/components/ui/HeartDisplay";
import { QuizQuestion } from "./QuizQuestion";
import { ResultsScreen } from "./ResultsScreen";
import type { LessonExercise } from "@/types/curriculum";

interface LessonShellProps {
  topicId: string;
  exercises: LessonExercise[];
}

export function LessonShell({ topicId, exercises }: LessonShellProps) {
  const [step, setStep] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const current = exercises[step];
  const total = exercises.length;
  const isLast = step === total - 1;

  function handleCorrect() {
    setXpEarned((x) => x + 10);
    setAnswered(true);
  }

  function handleWrong() {
    setWrongCount((w) => w + 1);
    setAnswered(true);
  }

  function handleNext() {
    if (isLast) {
      setShowResult(true);
      return;
    }
    setStep((s) => s + 1);
    setAnswered(false);
  }

  if (showResult) {
    return (
      <ResultsScreen
        topicId={topicId}
        xpEarned={xpEarned}
        totalExercises={total}
        onContinue={() => window.location.assign("/learn")}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Link href="/learn" className="p-2 -m-2 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </Link>
        <ProgressBar current={step + 1} total={total} />
        <div className="flex items-center gap-2">
          <HeartDisplay />
          <span className="text-sm font-medium text-primary">+{xpEarned} XP</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6">
        {current && (
          <QuizQuestion
            key={step}
            exercise={current}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            answered={answered}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}
