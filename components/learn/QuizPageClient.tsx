"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { QuizQuestion } from "./QuizQuestion";
import { completeQuiz } from "@/app/actions/progress";
import { RankUpScreen } from "./RankUpScreen";
import { getRankBySlug } from "@/lib/ranks";
import type { LessonExercise } from "@/types/curriculum";

interface QuizPageClientProps {
  topicId: string;
  exercises: LessonExercise[];
  xpReward: number;
  isBoss: boolean;
}

export function QuizPageClient({ topicId, exercises, xpReward, isBoss }: QuizPageClientProps) {
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  const [newRankSlug, setNewRankSlug] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const current = exercises[step];
  const total = exercises.length;
  const isLast = step === total - 1;

  function handleCorrect() {
    setCorrectCount((c) => c + 1);
    setAnswered(true);
  }

  function handleNext(lastAnswerCorrect?: boolean) {
    if (isLast) {
      const finalCorrect = correctCount + (lastAnswerCorrect ? 1 : 0);
      const score = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
      setShowScore(true);
      completeQuiz(topicId, score, score >= (isBoss ? 80 : 70) ? xpReward : 0).then((res) => {
        if (res.rankUp && res.newRankSlug) {
          setNewRankSlug(res.newRankSlug);
          setShowRankUp(true);
        }
      });
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
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = score >= (isBoss ? 80 : 70);
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="rounded-2xl bg-white border border-gray-200 p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz complete</h2>
          <p className="text-3xl font-bold text-primary mb-4">{score}%</p>
          <p className="text-gray-600 mb-6">
            {passed ? `You passed! +${xpReward} XP` : "Keep practicing to pass."}
          </p>
          <Link href="/learn" className="inline-block rounded-lg bg-primary px-6 py-2 text-white font-medium">
            Back to Learn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Link href="/learn" className="p-2 -m-2 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </Link>
        <span className="text-sm text-gray-500">
          Question {step + 1} of {total}
        </span>
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
