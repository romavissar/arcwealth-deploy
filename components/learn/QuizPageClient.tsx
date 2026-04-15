"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Trophy, X } from "lucide-react";
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
  if (score >= 76) return 150;
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
  const [reduceMotion, setReduceMotion] = useState(false);
  const heartDecrementedRef = useRef(false);

  const current = exercises[step];
  const total = exercises.length;
  const isLast = step === total - 1;
  const passThreshold = 76;
  const answeredCount = step;
  const currentPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;
  const pctColor =
    currentPct === null
      ? ""
      : currentPct >= 76
        ? "text-green-600 dark:text-green-400"
        : currentPct >= 75
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  function handleScored(credit: number) {
    setCorrectCount((c) => c + credit);
    setAnswered(true);
  }

  function handleNext() {
    if (isLast) {
      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      setFinalScore(score);
      const earned = redoMode ? 0 : isCheckpoint ? getCheckpointXP(score) : (score >= passThreshold ? xpReward : 0);
      setXpEarned(earned);
      setShowScore(true);
      if (score < 75 && !heartDecrementedRef.current) {
        heartDecrementedRef.current = true;
        decrementHeart().catch(() => {});
      }
      completeQuiz(topicId, score, earned, redoMode).then((res) => {
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReduceMotion(mediaQuery.matches);
    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (!showScore || finalScore === null || finalScore < 80 || reduceMotion) return;
    let cancelled = false;
    let followUpBurst: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;
      confetti({
        particleCount: 110,
        spread: 82,
        startVelocity: 50,
        origin: { y: 0.62 },
        colors: ["#818CF8", "#A78BFA", "#34D399", "#FCD34D"],
      });
      followUpBurst = setTimeout(() => {
        confetti({
          particleCount: 65,
          spread: 112,
          startVelocity: 38,
          origin: { y: 0.56 },
          colors: ["#818CF8", "#C4B5FD", "#6EE7B7", "#FDE68A"],
        });
      }, 220);
    };

    run();

    return () => {
      cancelled = true;
      if (followUpBurst) clearTimeout(followUpBurst);
    };
  }, [showScore, finalScore, reduceMotion]);

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
    const lostHeart = score < 75;
    const isHighScoreWin = passed && score >= 80;
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden ${
          isHighScoreWin
            ? "bg-gradient-to-br from-indigo-950 via-slate-950 to-primary/75 dark:from-indigo-950 dark:via-slate-950 dark:to-primary/85"
            : "bg-gray-50 dark:bg-gray-900"
        }`}
      >
        {isHighScoreWin && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-400/35 blur-3xl motion-safe:animate-pulse"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-10 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl motion-safe:animate-pulse"
            />
          </>
        )}
        <div
          className={`relative rounded-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-500 ${
            isHighScoreWin
              ? "border border-indigo-300/40 bg-slate-900/85 text-slate-50 shadow-[0_0_0_1px_rgba(129,140,248,0.25),0_20px_80px_-25px_rgba(79,70,229,0.75)] backdrop-blur"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
          }`}
        >
          {isHighScoreWin && (
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-100 animate-in fade-in slide-in-from-top-2 duration-500">
              <Trophy className="h-3.5 w-3.5" />
              Win Streak
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          )}
          <h2 className={`text-2xl font-bold mb-2 ${isHighScoreWin ? "text-indigo-50" : "text-gray-900 dark:text-gray-100"}`}>
            Quiz complete
          </h2>
          <p
            className={`text-3xl font-bold mb-4 ${
              isHighScoreWin
                ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-100 to-emerald-200 motion-safe:animate-pulse"
                : "text-primary"
            }`}
          >
            {score}%
          </p>
          <p className={`${isHighScoreWin ? "text-indigo-100/85" : "text-gray-600 dark:text-gray-300"} mb-2`}>
            {redoMode ? "Redo complete — no XP" : passed ? `You passed! +${xpEarned} XP` : "Keep practicing to pass."}
          </p>
          {lostHeart && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">Below 75% — one heart lost.</p>
          )}
          {!passed && (
            <Link
              href={`/learn/${topicId}/quiz`}
              className="mb-3 inline-block rounded-lg bg-amber-500 px-6 py-2 text-white font-medium hover:bg-amber-600 min-h-11"
            >
              Try again
            </Link>
          )}
          {passed && (
            <Link
              href={`/learn/${topicId}/quiz?redo=1`}
              className={`mb-3 inline-block rounded-lg px-6 py-2 text-white font-medium min-h-11 ${
                isHighScoreWin ? "bg-indigo-500/45 border border-indigo-300/35 hover:bg-indigo-500/60" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              Redo to improve
            </Link>
          )}
          <div>
            <Link
              href="/learn"
              className={`inline-block rounded-lg px-6 py-2 text-white font-medium min-h-11 ${
                isHighScoreWin
                  ? "bg-gradient-to-r from-indigo-400 via-primary to-emerald-400 text-indigo-950 font-bold hover:opacity-95 shadow-[0_12px_35px_-12px_rgba(129,140,248,0.85)]"
                  : "bg-primary"
              }`}
            >
              Back to Learn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900 z-50">
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sm:px-4">
        <Link href="/learn" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200">
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
        <div className="w-11 shrink-0" aria-hidden />
      </div>
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 sm:p-6">
        {current && (
          <QuizQuestion
            key={step}
            exercise={current}
            onScored={handleScored}
            answered={answered}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}
