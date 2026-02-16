"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { HeartDisplay } from "@/components/ui/HeartDisplay";
import { LessonContentStep } from "./LessonContentStep";
import { QuizQuestion } from "./QuizQuestion";
import { ResultsScreen } from "./ResultsScreen";
import type { LessonExercise, LessonStep } from "@/types/curriculum";

interface LessonShellProps {
  topicId: string;
  /** Legacy: list of exercises only (no content steps). */
  exercises?: LessonExercise[];
  /** Textbook-based lesson: mix of content and exercise steps. Takes precedence over exercises. */
  steps?: LessonStep[];
  /** Redo: no XP awarded. */
  redoMode?: boolean;
}

export function LessonShell({ topicId, exercises = [], steps: stepsProp, redoMode = false }: LessonShellProps) {
  const steps = useMemo<LessonStep[]>(() => {
    if (stepsProp && stepsProp.length > 0) return stepsProp;
    return exercises.map((exercise) => ({ type: "exercise" as const, exercise }));
  }, [stepsProp, exercises]);

  const [step, setStep] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const current = steps[step];
  const total = steps.length;
  const exerciseCount = useMemo(() => steps.filter((s) => s.type === "exercise").length, [steps]);
  const isLast = step === total - 1;
  const correctCount = Math.floor(xpEarned / 10);
  const totalAnswered = correctCount + wrongCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : null;

  function handleCorrect() {
    if (!redoMode) setXpEarned((x) => x + 10);
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
        xpEarned={redoMode ? 0 : xpEarned}
        totalExercises={exerciseCount}
        wrongCount={wrongCount}
        redoMode={redoMode}
        onContinue={() => window.location.assign("/learn")}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Link href="/learn" className="p-2 -m-2 text-gray-500 hover:text-gray-700 shrink-0">
          <X className="h-5 w-5" />
        </Link>
        <div className="flex-1 flex justify-center items-center min-w-0 px-2">
          <ProgressBar current={step + 1} total={total} accuracy={accuracy} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <HeartDisplay />
          <span className="text-sm font-medium text-primary">{redoMode ? "Redo (no XP)" : `+${xpEarned} XP`}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex flex-col items-center justify-start p-6">
        {current?.type === "content" && (
          <LessonContentStep
            key={step}
            title={current.title}
            body={current.body}
            onNext={handleNext}
          />
        )}
        {current?.type === "exercise" && (
          <QuizQuestion
            key={step}
            exercise={current.exercise}
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
