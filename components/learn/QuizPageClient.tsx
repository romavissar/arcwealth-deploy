"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { QuizQuestion } from "./QuizQuestion";
import { completeQuiz, decrementHeart } from "@/app/actions/progress";
import { RankUpScreen } from "./RankUpScreen";
import { getRankBySlug } from "@/lib/ranks";
import type { LessonExercise } from "@/types/curriculum";

interface QuizPageClientProps {
  topicId: string;
  exercises: LessonExercise[];
  xpReward: number;
  isBoss: boolean;
  isCheckpoint?: boolean;
  redoMode?: boolean;
}

/** Checkpoint XP: 80% → 150, 90% → 200, 100% → 250. */
function getCheckpointXP(score: number): number {
  if (score >= 100) return 250;
  if (score >= 90) return 200;
  if (score >= 80) return 150;
  return 0;
}

export function QuizPageClient({ topicId, exercises, xpReward, isBoss, isCheckpoint = false, redoMode = false }: QuizPageClientProps) {
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [showRankUp, setShowRankUp] = useState(false);
  const [newRankSlug, setNewRankSlug] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const heartDecrementedRef = useRef(false);

  const current = exercises[step];
  const total = exercises.length;
  const isLast = step === total - 1;
  const passThreshold = isCheckpoint ? 80 : isBoss ? 80 : 70;
  const answeredCount = step;
  const currentPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;
  const pctColor =
    currentPct === null
      ? ""
      : currentPct >= 80
        ? "text-green-600 dark:text-green-400"
        : currentPct >= 70
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  function handleCorrect() {
    setCorrectCount((c) => c + 1);
    setAnswered(true);
  }

  function handleNext(lastAnswerCorrect?: boolean) {
    if (isLast) {
      const finalCorrect = correctCount + (lastAnswerCorrect ? 1 : 0);
      const score = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
      setFinalScore(score);
      const earned = redoMode ? 0 : isCheckpoint ? getCheckpointXP(score) : (score >= passThreshold ? xpReward : 0);
      setXpEarned(earned);
      setShowScore(true);
      if (score < 70 && !heartDecrementedRef.current) {
        heartDecrementedRef.current = true;
        decrementHeart().catch(() => {});
      }
      if (score >= passThreshold) {
        completeQuiz(topicId, score, earned, redoMode).then((res) => {
          if (res.rankUp && res.newRankSlug) {
            setNewRankSlug(res.newRankSlug);
            setShowRankUp(true);
          }
        });
      }
      return;
    }
    setStep((s) => s + 1);
    setAnswered(false);
  }

  if (showRankUp && newRankSlug) {
    const newRank = getRankBySlug(newRankSlug);
    const prevRank = getRankBySlug("novice");
    if (!newRank) return null;
    return (
      <RankUpScreen
        previousRank={prevRank ?? newRank}
        newRank={newRank}
        xpEarned={xpReward}
        totalXP={0}
        userLevel={1}
        onContinue={() => window.location.assign("/learn")}
      />
    );
  }

  if (showScore) {
    const score = finalScore ?? (total > 0 ? Math.round((correctCount / total) * 100) : 0);
    const passed = score >= passThreshold;
    const lostHeart = score < 70;
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quiz complete</h2>
          <p className="text-3xl font-bold text-primary mb-4">{score}%</p>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {redoMode ? "Redo complete — no XP" : passed ? `You passed! +${xpEarned} XP` : "Keep practicing to pass."}
          </p>
          {lostHeart && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">Below 70% — one heart lost.</p>
          )}
          <Link href="/learn" className="inline-block rounded-lg bg-primary px-6 py-2 text-white font-medium">
            Back to Learn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Link href="/learn" className="p-2 -m-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X className="h-5 w-5" />
        </Link>
        <div className="flex flex-col items-center min-w-0 flex-1 mx-2">
          {isCheckpoint && (
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate w-full text-center">
              Checkpoint Quiz
            </span>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {step + 1} of {total}
            {currentPct !== null && (
              <>
                {" · "}
                <span className={pctColor}>{currentPct}%</span>
              </>
            )}
          </span>
        </div>
        <div className="w-9 shrink-0" aria-hidden />
      </div>
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6">
        {current && (
          <QuizQuestion
            key={step}
            exercise={current}
            onCorrect={handleCorrect}
            onWrong={() => setAnswered(true)}
            answered={answered}
            onNext={(correct) => handleNext(isLast ? correct : undefined)}
          />
        )}
      </div>
    </div>
  );
}
