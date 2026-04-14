"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { HeartDisplay } from "@/components/ui/HeartDisplay";
import { LessonContentStep } from "./LessonContentStep";
import { QuizQuestion } from "./QuizQuestion";
import { ResultsScreen } from "./ResultsScreen";
import type { LessonContent, LessonExercise, LessonStep } from "@/types/curriculum";
import { Button } from "@/components/ui/button";

interface LessonShellProps {
  topicId: string;
  /** Legacy: list of exercises only (no content steps). */
  exercises?: LessonExercise[];
  /** Guide-native lesson payload with section flow metadata. */
  level?: LessonContent["level"];
  streakDays?: number;
  /** Textbook-based lesson: mix of content and exercise steps. Takes precedence over exercises. */
  steps?: LessonStep[];
  /** Redo: no XP awarded. */
  redoMode?: boolean;
}

type FlowStep =
  | { type: "hook"; title: string; body: string }
  | { type: "concept"; title: string; body: string }
  | { type: "check"; exercise: LessonExercise }
  | { type: "apply"; exercise: LessonExercise }
  | { type: "lock_in" };

interface ReviewQueueItem {
  keyTerm: string;
  definition: string;
  moduleId: string;
  quickRecallPrompt: string;
}

const REVIEW_QUEUE_KEY = "reviewQueue";

export function LessonShell({
  topicId,
  exercises = [],
  level,
  streakDays = 0,
  steps: stepsProp,
  redoMode = false,
}: LessonShellProps) {
  const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
  const flow = useMemo<FlowStep[]>(() => {
    if (level) {
      const checkSteps = (level.check?.questions ?? []).map((exercise) => ({ type: "check" as const, exercise }));
      const applySteps = (level.apply?.tasks ?? []).map((exercise) => ({ type: "apply" as const, exercise }));
      return [
        {
          type: "hook",
          title: "Hook",
          body: `${level.hook.fact}\n\n**${level.hook.question}**`,
        },
        ...level.conceptCards.map((card, index) => ({
          type: "concept" as const,
          title: card.title || `Concept ${index + 1}`,
          body: card.body,
        })),
        ...checkSteps,
        ...applySteps,
        { type: "lock_in" as const },
      ];
    }

    const legacySteps = (() => {
    if (stepsProp && stepsProp.length > 0) return stepsProp;
    return exercises.map((exercise) => ({ type: "exercise" as const, exercise }));
    })();

    return legacySteps.map((step) =>
      step.type === "content"
        ? { type: "concept" as const, title: step.title, body: step.body }
        : { type: "check" as const, exercise: step.exercise }
    );
  }, [level, stepsProp, exercises]);

  const [step, setStep] = useState(0);
  const [checkCorrectCount, setCheckCorrectCount] = useState(0);
  const [applyCorrectCount, setApplyCorrectCount] = useState(0);
  const [answeredExerciseCount, setAnsweredExerciseCount] = useState(0);
  const [scoredSteps, setScoredSteps] = useState<Set<number>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [quickRecall, setQuickRecall] = useState<ReviewQueueItem | null>(null);

  const current = flow[step];
  const total = flow.length;
  const checkCount = useMemo(() => flow.filter((s) => s.type === "check").length, [flow]);
  const applyCount = useMemo(() => flow.filter((s) => s.type === "apply").length, [flow]);
  const exerciseCount = checkCount + applyCount;
  const isLast = step === total - 1;
  const rawAccuracy =
    answeredExerciseCount > 0 ? Math.round(((checkCorrectCount + applyCorrectCount) / answeredExerciseCount) * 100) : null;
  const accuracy = rawAccuracy === null ? null : clampPercent(rawAccuracy);
  const finalScoreRaw = exerciseCount > 0 ? Math.round(((checkCorrectCount + applyCorrectCount) / exerciseCount) * 100) : 100;
  const finalScore = clampPercent(finalScoreRaw);

  const xpConfig = level?.xp ?? {
    base: 10,
    perCheckFirstTryCorrect: 2,
    perApplyFirstTryCorrect: 3,
    perfectRunBonus: 5,
  };
  const perfectRun = wrongCount === 0 && exerciseCount > 0 && checkCorrectCount + applyCorrectCount === exerciseCount;
  const rawXpEarned = redoMode
    ? 0
    : xpConfig.base +
      checkCorrectCount * xpConfig.perCheckFirstTryCorrect +
      applyCorrectCount * xpConfig.perApplyFirstTryCorrect +
      (perfectRun ? xpConfig.perfectRunBonus : 0);
  const xpEarned = Math.round(rawXpEarned);
  const xpBreakdown = `${xpConfig.base} base + ${
    checkCorrectCount * xpConfig.perCheckFirstTryCorrect
  } Check + ${applyCorrectCount * xpConfig.perApplyFirstTryCorrect} Apply + ${perfectRun ? xpConfig.perfectRunBonus : 0} perfect = ${xpEarned} XP`;

  useEffect(() => {
    if (!level?.reviewQueueEntry) return;
    try {
      const raw = window.localStorage.getItem(REVIEW_QUEUE_KEY);
      const queue = raw ? (JSON.parse(raw) as ReviewQueueItem[]) : [];
      const candidates = queue.filter((item) => item.keyTerm !== level.reviewQueueEntry.keyTerm);
      if (candidates.length === 0) return;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setQuickRecall(pick);
    } catch {
      setQuickRecall(null);
    }
  }, [level?.reviewQueueEntry]);

  const persistReviewQueue = () => {
    if (!level?.reviewQueueEntry) return;
    try {
      const raw = window.localStorage.getItem(REVIEW_QUEUE_KEY);
      const queue = raw ? (JSON.parse(raw) as ReviewQueueItem[]) : [];
      const deduped = queue.filter((item) => item.keyTerm !== level.reviewQueueEntry?.keyTerm);
      deduped.push(level.reviewQueueEntry);
      window.localStorage.setItem(REVIEW_QUEUE_KEY, JSON.stringify(deduped.slice(-30)));
    } catch {
      // no-op
    }
  };

  function handleScored(credit: number) {
    if (scoredSteps.has(step)) {
      setAnswered(true);
      return;
    }
    setScoredSteps((prev) => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
    const normalizedCredit = Math.max(0, Math.min(1, credit));
    if (current?.type === "check") setCheckCorrectCount((count) => count + normalizedCredit);
    if (current?.type === "apply") setApplyCorrectCount((count) => count + normalizedCredit);
    if (normalizedCredit < 1) setWrongCount((w) => w + 1);
    setAnsweredExerciseCount((count) => count + 1);
    setAnswered(true);
  }

  function handleNext() {
    if (isLast) {
      persistReviewQueue();
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
        xpBreakdown={xpBreakdown}
        quickRecall={quickRecall}
        totalExercises={exerciseCount}
        wrongCount={wrongCount}
        score={finalScore}
        redoMode={redoMode}
        onContinue={() => window.location.assign("/learn")}
      />
    );
  }

  const sectionProgress = (() => {
    if (current?.type === "hook") return "Hook";
    if (current?.type === "concept") return "Concept";
    if (current?.type === "check") return "Check";
    if (current?.type === "apply") return "Apply";
    return "Lock-in";
  })();

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
        <Link href="/learn" className="p-2 -m-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 shrink-0">
          <X className="h-5 w-5" />
        </Link>
        <div className="flex-1 flex justify-center items-center min-w-0 px-2">
          <ProgressBar current={step + 1} total={total} accuracy={accuracy} sectionLabel={sectionProgress} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <HeartDisplay />
          <span className="text-sm font-medium text-[var(--indigo-fill)]">{streakDays} day streak</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6">
        {current?.type === "hook" && (
          <LessonContentStep key={step} title={current.title} body={current.body} onNext={handleNext} />
        )}
        {current?.type === "concept" && (
          <LessonContentStep
            key={step}
            title={current.title}
            body={current.body}
            onNext={handleNext}
          />
        )}
        {(current?.type === "check" || current?.type === "apply") && (
          <QuizQuestion
            key={step}
            exercise={current.exercise as LessonExercise}
            onScored={handleScored}
            answered={answered}
            onNext={handleNext}
          />
        )}
        {current?.type === "lock_in" && level && (
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <p className="mb-3 inline-block rounded-full px-3 py-1 text-sm font-semibold text-[var(--amber-text)] bg-[var(--amber-fill)]">
              {level.lockIn.keyTerm}
            </p>
            <p className="text-lg font-medium mb-4">{level.lockIn.takeaway}</p>
            <p className="text-sm text-[var(--text-muted)] mb-1">{xpBreakdown}</p>
            {wrongCount > 0 && (
              <p className="text-sm text-[var(--text-muted)] mb-4">You can revisit this concept in your review queue.</p>
            )}
            <Button className="min-h-11" onClick={handleNext}>
              {level.lockIn.continueLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
