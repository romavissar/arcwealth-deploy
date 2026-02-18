"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { LessonExercise } from "@/types/curriculum";

/** Fisher–Yates shuffle. Returns new array; does not mutate. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffle options and update correct_index so the same option stays correct. Gives ~25% each position over many questions. */
function shuffleOptionsAndCorrectIndex<
  T extends { options: string[]; correct_index: number },
>(ex: T): T {
  const indices = ex.options.map((_, i) => i);
  const shuffledIndices = shuffle(indices);
  const newOptions = shuffledIndices.map((i) => ex.options[i]);
  const newCorrectIndex = shuffledIndices.indexOf(ex.correct_index);
  return { ...ex, options: newOptions, correct_index: newCorrectIndex };
}

interface QuizQuestionProps {
  exercise: LessonExercise;
  onCorrect: () => void;
  onWrong: () => void;
  answered: boolean;
  onNext: (lastAnswerCorrect?: boolean) => void;
}

export function QuizQuestion({ exercise, onCorrect, onWrong, answered, onNext }: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);

  const displayExercise = useMemo(() => {
    if (
      exercise.kind === "multiple_choice" ||
      exercise.kind === "fill_blank" ||
      exercise.kind === "scenario"
    ) {
      return shuffleOptionsAndCorrectIndex(exercise);
    }
    return exercise;
  }, [exercise]);

  function submitChoice(index: number) {
    if (answered) return;
    setSelected(index);
    const correct =
      displayExercise.kind === "multiple_choice" ||
      displayExercise.kind === "fill_blank" ||
      displayExercise.kind === "scenario"
        ? index === displayExercise.correct_index
        : displayExercise.kind === "true_false"
          ? (index === 0) === displayExercise.correct
          : false;
    setFeedback(correct ? "correct" : "wrong");
    setLastCorrect(correct);
    if (correct) onCorrect();
    else onWrong();
  }

  const feedbackBoxClass = (fb: "correct" | "wrong") =>
    fb === "correct"
      ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-100"
      : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-100";

  if (displayExercise.kind === "multiple_choice") {
    return (
      <div className="w-full max-w-lg">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{displayExercise.question}</p>
        <div className="space-y-3">
          {displayExercise.options.map((opt, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start h-auto min-h-11 py-4 px-4 text-left whitespace-normal break-words"
              disabled={answered}
              onClick={() => submitChoice(i)}
              style={
                feedback && selected === i
                  ? feedback === "correct"
                    ? { borderColor: "var(--success)", backgroundColor: "rgba(16, 185, 129, 0.1)" }
                    : { borderColor: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.1)" }
                  : undefined
              }
            >
              {opt}
            </Button>
          ))}
        </div>
        {feedback && (
          <div className={`mt-6 p-4 rounded-lg ${feedbackBoxClass(feedback)}`}>
            <p className="font-medium">{feedback === "correct" ? "✓ Correct!" : "Incorrect"}</p>
            <p className="text-sm mt-1 opacity-90 text-gray-700 dark:text-gray-300">{displayExercise.explanation}</p>
            <Button className="mt-4" onClick={() => onNext(lastCorrect)}>Next</Button>
          </div>
        )}
      </div>
    );
  }

  if (displayExercise.kind === "true_false") {
    return (
      <div className="w-full max-w-lg">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{displayExercise.statement}</p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" disabled={answered} onClick={() => submitChoice(0)}>
            True
          </Button>
          <Button variant="outline" className="flex-1" disabled={answered} onClick={() => submitChoice(1)}>
            False
          </Button>
        </div>
        {feedback && (
          <div className={`mt-6 p-4 rounded-lg ${feedbackBoxClass(feedback)}`}>
            <p className="font-medium">{feedback === "correct" ? "✓ Correct!" : "Incorrect"}</p>
            <p className="text-sm mt-1 opacity-90 text-gray-700 dark:text-gray-300">{displayExercise.explanation}</p>
            <Button className="mt-4" onClick={() => onNext(lastCorrect)}>Next</Button>
          </div>
        )}
      </div>
    );
  }

  if (displayExercise.kind === "fill_blank") {
    return (
      <div className="w-full max-w-lg">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          {displayExercise.sentence.replace("___", "______")}
        </p>
        <div className="flex flex-wrap gap-2">
          {displayExercise.options.map((opt, i) => (
            <Button key={i} variant="outline" disabled={answered} onClick={() => submitChoice(i)}>
              {opt}
            </Button>
          ))}
        </div>
        {feedback && (
          <div className={`mt-6 p-4 rounded-lg ${feedbackBoxClass(feedback)}`}>
            <p className="font-medium">{feedback === "correct" ? "✓ Correct!" : "Incorrect"}</p>
            <p className="text-sm mt-1 opacity-90 text-gray-700 dark:text-gray-300">{displayExercise.explanation}</p>
            <Button className="mt-4" onClick={() => onNext(lastCorrect)}>Next</Button>
          </div>
        )}
      </div>
    );
  }

  if (displayExercise.kind === "scenario") {
    return (
      <div className="w-full max-w-lg">
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-200">{displayExercise.scenario}</p>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{displayExercise.question}</p>
        <div className="space-y-3">
          {displayExercise.options.map((opt, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start h-auto min-h-11 py-4 px-4 text-left whitespace-normal break-words"
              disabled={answered}
              onClick={() => submitChoice(i)}
            >
              {opt}
            </Button>
          ))}
        </div>
        {feedback && (
          <div className={`mt-6 p-4 rounded-lg ${feedbackBoxClass(feedback)}`}>
            <p className="font-medium">{feedback === "correct" ? "✓ Correct!" : "Incorrect"}</p>
            <p className="text-sm mt-1 opacity-90 text-gray-700 dark:text-gray-300">{displayExercise.explanation}</p>
            <Button className="mt-4" onClick={() => onNext(lastCorrect)}>Next</Button>
          </div>
        )}
      </div>
    );
  }

  if (displayExercise.kind === "match_pairs") {
    return (
      <div className="w-full max-w-lg">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Match the pairs</p>
        <div className="space-y-2">
          {displayExercise.pairs.map((p, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-200">{p.left}</span>
              <span className="text-gray-400 dark:text-gray-500">→</span>
              <span className="text-gray-700 dark:text-gray-200">{p.right}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Match pairs (simplified: no drag for now)</p>
        <Button className="mt-4" onClick={() => { setLastCorrect(true); setFeedback("correct"); onCorrect(); }}>I matched them</Button>
        {answered && (
          <Button className="mt-2 ml-2" onClick={() => onNext(lastCorrect)}>Next</Button>
        )}
      </div>
    );
  }

  return null;
}
