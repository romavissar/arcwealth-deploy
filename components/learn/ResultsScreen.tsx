"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeLesson, decrementHeart } from "@/app/actions/progress";

interface ResultsScreenProps {
  topicId: string;
  xpEarned: number;
  xpBreakdown?: string;
  quickRecall?: { keyTerm: string; definition: string; quickRecallPrompt: string } | null;
  totalExercises: number;
  wrongCount: number;
  score: number;
  redoMode?: boolean;
  onContinue: () => void;
}

export function ResultsScreen({
  topicId,
  xpEarned,
  xpBreakdown,
  quickRecall,
  totalExercises,
  wrongCount,
  score,
  redoMode = false,
  onContinue,
}: ResultsScreenProps) {
  const perfect = wrongCount === 0;
  const passed = score >= 76;
  const loseHeart = totalExercises > 0 && score < 75;
  const displayXp = !redoMode && passed ? xpEarned : 0;
  const isHighScoreWin = passed && score >= 80;
  const [showRecallAnswer, setShowRecallAnswer] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const heartDecrementedRef = useRef(false);
  const lessonAttemptRecordedRef = useRef(false);

  useEffect(() => {
    if (!lessonAttemptRecordedRef.current) {
      lessonAttemptRecordedRef.current = true;
      completeLesson(topicId, xpEarned, score, redoMode).catch(() => {});
    }
  }, [topicId, xpEarned, score, redoMode]);

  useEffect(() => {
    if (loseHeart && !heartDecrementedRef.current) {
      heartDecrementedRef.current = true;
      decrementHeart().catch(() => {});
    }
  }, [loseHeart]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReduceMotion(mediaQuery.matches);
    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (!isHighScoreWin || reduceMotion) return;
    let cancelled = false;
    let followUpBurst: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 52,
        origin: { y: 0.62 },
        colors: ["#818CF8", "#A78BFA", "#34D399", "#FCD34D"],
      });
      followUpBurst = setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 110,
          startVelocity: 40,
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
  }, [isHighScoreWin, reduceMotion]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-50 p-6 overflow-hidden ${
        isHighScoreWin
          ? "bg-gradient-to-br from-indigo-950 via-slate-950 to-primary/70 dark:from-indigo-950 dark:via-slate-950 dark:to-primary/80"
          : "bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20"
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
        className={`relative rounded-2xl p-8 max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-500 ${
          isHighScoreWin
            ? "border border-indigo-300/40 bg-slate-900/85 text-slate-50 shadow-[0_0_0_1px_rgba(129,140,248,0.25),0_20px_80px_-25px_rgba(79,70,229,0.75)] backdrop-blur"
            : "bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-600"
        }`}
      >
        {isHighScoreWin && (
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-100 animate-in fade-in slide-in-from-top-2 duration-500">
            <Trophy className="h-3.5 w-3.5" />
            Victory
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        )}
        <h2 className={`text-2xl font-bold mb-2 ${isHighScoreWin ? "text-indigo-50" : "text-gray-900 dark:text-gray-100"}`}>
          {passed ? "Lesson complete!" : "Lesson finished"}
        </h2>
        <p className={`text-sm font-medium mb-2 ${isHighScoreWin ? "text-indigo-100/90" : "text-gray-600 dark:text-gray-300"}`}>
          Accuracy: {score}%
        </p>
        <p
          className={`font-semibold text-xl mb-6 ${
            isHighScoreWin
              ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-100 to-emerald-200 motion-safe:animate-pulse"
              : "text-primary"
          }`}
        >
          {redoMode ? "Redo complete — no XP" : `+${displayXp} XP`}
        </p>
        {xpBreakdown && !redoMode && (
          <p className={`text-xs mb-4 ${isHighScoreWin ? "text-indigo-100/70" : "text-gray-500 dark:text-gray-400"}`}>{xpBreakdown}</p>
        )}
        {perfect ? (
          <p className={`${isHighScoreWin ? "text-indigo-50/90" : "text-gray-600 dark:text-gray-300"} mb-8`}>
            You finished {totalExercises} exercise{totalExercises !== 1 ? "s" : ""} with no mistakes. Keep it up!
          </p>
        ) : passed ? (
          <p className={`${isHighScoreWin ? "text-indigo-50/90" : "text-gray-600 dark:text-gray-300"} mb-8`}>
            You had {wrongCount} mistake{wrongCount !== 1 ? "s" : ""}. Lesson marked complete — next one unlocked!
          </p>
        ) : (
          <p className={`${isHighScoreWin ? "text-indigo-50/90" : "text-gray-600 dark:text-gray-300"} mb-8`}>
            You had {wrongCount} mistake{wrongCount !== 1 ? "s" : ""}. Get at least 76% correct to mark the lesson
            complete and unlock the next.
          </p>
        )}
        {loseHeart && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-4">Below 75% — one heart lost.</p>
        )}
        <div
          className={`mb-5 rounded-xl p-4 text-left ${
            isHighScoreWin
              ? "border border-indigo-300/25 bg-slate-950/45"
              : "border border-gray-200/70 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/50"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
              isHighScoreWin ? "text-indigo-100/75" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Quick Recall
          </p>
          {quickRecall ? (
            <>
              <p className={`text-sm font-medium ${isHighScoreWin ? "text-indigo-50" : "text-gray-900 dark:text-gray-100"}`}>
                {quickRecall.quickRecallPrompt}
              </p>
              {showRecallAnswer ? (
                <p className={`mt-2 text-sm ${isHighScoreWin ? "text-indigo-100/80" : "text-gray-600 dark:text-gray-300"}`}>
                  <span className="font-semibold">{quickRecall.keyTerm}:</span> {quickRecall.definition}
                </p>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className={`mt-3 min-h-11 ${isHighScoreWin ? "border-indigo-300/35 bg-slate-900/55 text-indigo-100 hover:bg-indigo-500/20" : ""}`}
                  onClick={() => setShowRecallAnswer(true)}
                >
                  Reveal answer
                </Button>
              )}
            </>
          ) : (
            <p className={`text-sm ${isHighScoreWin ? "text-indigo-100/80" : "text-gray-600 dark:text-gray-300"}`}>
              Quick recall unlocks after you complete more lessons.
            </p>
          )}
        </div>
        {passed && (
          <Button
            size="lg"
            variant="outline"
            className={`mb-3 w-full ${isHighScoreWin ? "border-indigo-300/35 bg-indigo-500/10 text-indigo-50 hover:bg-indigo-500/20" : ""}`}
            asChild
          >
            <Link href={`/learn/${topicId}/lesson?redo=1`}>Redo to improve</Link>
          </Button>
        )}
        <Button
          size="lg"
          className={`w-full ${
            isHighScoreWin
              ? "bg-gradient-to-r from-indigo-400 via-primary to-emerald-400 text-indigo-950 font-bold hover:opacity-95 shadow-[0_12px_35px_-12px_rgba(129,140,248,0.85)]"
              : ""
          }`}
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
