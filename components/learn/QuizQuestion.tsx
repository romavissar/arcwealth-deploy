"use client";

import { useMemo, useState } from "react";
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

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.-]/g, "");
    if (!normalized) return null;
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function inferNumericTarget(exercise: LessonExercise): number | null {
  const min = toFiniteNumber((exercise as { min?: unknown }).min);
  const max = toFiniteNumber((exercise as { max?: unknown }).max);
  const inRange = (value: number | null) =>
    value !== null &&
    (min === null || value >= min) &&
    (max === null || value <= max);

  const fromSnake = toFiniteNumber((exercise as { correct_value?: unknown }).correct_value);
  const fromCamel = toFiniteNumber((exercise as { correctValue?: unknown }).correctValue);
  if (inRange(fromSnake)) return fromSnake;
  if (inRange(fromCamel)) return fromCamel;

  const explanation = (exercise as { explanation?: unknown }).explanation;
  if (typeof explanation === "string") {
    const matches = explanation.match(/[€$£]?\s*[0-9][0-9,]*(?:\.[0-9]+)?/g);
    if (matches && matches.length > 0) {
      const fromExplanation = toFiniteNumber(matches[matches.length - 1]);
      if (inRange(fromExplanation)) return fromExplanation;
    }
  }

  if (fromSnake !== null) return fromSnake;
  if (fromCamel !== null) return fromCamel;
  return null;
}

interface QuizQuestionProps {
  exercise: LessonExercise;
  onScored: (credit: number) => void;
  answered: boolean;
  onNext: () => void;
}

export function QuizQuestion({ exercise, onScored, answered, onNext }: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "partial" | "wrong" | null>(null);
  const [ordering, setOrdering] = useState<number[]>([]);
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [multiBlankAnswers, setMultiBlankAnswers] = useState<string[]>([]);
  const [typedInputs, setTypedInputs] = useState<string[]>([]);
  const [numericAmountInput, setNumericAmountInput] = useState<string | null>(null);
  const [selectedLeftMatch, setSelectedLeftMatch] = useState<number | null>(null);
  const [matchAssignments, setMatchAssignments] = useState<Record<number, number>>({});
  const [matchEvaluation, setMatchEvaluation] = useState<Record<number, boolean> | null>(null);
  const [matchLocked, setMatchLocked] = useState(false);
  const orderingSeed = useMemo(
    () => (exercise.kind === "ordering" ? shuffle(exercise.items.map((_, index) => index)) : []),
    [exercise]
  );
  const matchRightOrder = useMemo(
    () => (exercise.kind === "match_pairs" ? shuffle(exercise.pairs.map((_, index) => index)) : []),
    [exercise]
  );

  const displayExercise = useMemo(() => {
    if (
      exercise.kind === "multiple_choice" ||
      exercise.kind === "fill_blank" ||
      exercise.kind === "scenario" ||
      exercise.kind === "spot_mistake"
    ) {
      return shuffleOptionsAndCorrectIndex(exercise);
    }
    return exercise;
  }, [exercise]);

  function submitScore(rawCredit: number) {
    if (answered) return;
    const credit = Math.max(0, Math.min(1, rawCredit));
    setFeedback(credit === 1 ? "correct" : credit > 0 ? "partial" : "wrong");
    onScored(credit);
  }

  function submitChoice(index: number) {
    if (answered) return;
    setSelected(index);
    const correct =
      displayExercise.kind === "multiple_choice" ||
      displayExercise.kind === "fill_blank" ||
      displayExercise.kind === "scenario" ||
      displayExercise.kind === "spot_mistake"
        ? index === displayExercise.correct_index
        : displayExercise.kind === "true_false"
          ? (index === 0) === displayExercise.correct
          : false;
    submitScore(correct ? 1 : 0);
  }

  const feedbackBoxClass = (fb: "correct" | "partial" | "wrong") =>
    fb === "correct"
      ? "text-[var(--emerald-text)] border border-[var(--emerald-border)]"
      : fb === "partial"
        ? "text-amber-200 border border-amber-400/70"
      : "text-[var(--red-text)] border border-[var(--red-border)]";

  const explanation = displayExercise.explanation ?? "Review and continue.";

  function renderFeedback() {
    if (!feedback) return null;
    return (
      <div
        className={`mt-6 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200 ${feedbackBoxClass(feedback)}`}
        style={{
          backgroundColor:
            feedback === "correct"
              ? "rgba(16, 185, 129, 0.14)"
              : feedback === "partial"
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(239, 68, 68, 0.12)",
        }}
      >
        <p className="font-medium">
          {feedback === "correct" ? "Correct - nice work" : feedback === "partial" ? "Partly correct" : "Not quite yet"}
        </p>
        <p className="text-sm mt-1 text-[var(--text-muted)]">{explanation}</p>
        <Button className="mt-4 min-h-11" onClick={onNext}>
          Next
        </Button>
      </div>
    );
  }

  if (displayExercise.kind === "multiple_choice") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{displayExercise.question}</p>
        <div className="space-y-3">
          {displayExercise.options.map((opt, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start h-auto min-h-11 py-4 px-4 text-left whitespace-normal break-words transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50"
              disabled={answered}
              onClick={() => submitChoice(i)}
              style={
                feedback && selected === i
                  ? feedback === "correct"
                    ? { borderColor: "var(--emerald-border)", backgroundColor: "rgba(16, 185, 129, 0.16)", color: "var(--text-primary)" }
                    : { borderColor: "var(--red-border)", backgroundColor: "rgba(239, 68, 68, 0.14)", color: "var(--text-primary)" }
                  : undefined
              }
            >
              {opt}
            </Button>
          ))}
        </div>
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "true_false") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{displayExercise.statement}</p>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 min-h-11 transition-all duration-200 hover:-translate-y-0.5" disabled={answered} onClick={() => submitChoice(0)}>
            True
          </Button>
          <Button variant="outline" className="flex-1 min-h-11 transition-all duration-200 hover:-translate-y-0.5" disabled={answered} onClick={() => submitChoice(1)}>
            False
          </Button>
        </div>
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "fill_blank") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          {displayExercise.sentence.replace("___", "______")}
        </p>
        <div className="flex flex-wrap gap-2">
          {displayExercise.options.map((opt, i) => (
            <Button key={i} variant="outline" className="min-h-11 transition-all duration-200 hover:-translate-y-0.5" disabled={answered} onClick={() => submitChoice(i)}>
              {opt}
            </Button>
          ))}
        </div>
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "multi_blank") {
    const blankCount = (displayExercise.sentence.match(/___/g) ?? []).length;
    const answerSlots = Array.from({ length: blankCount }, (_, index) => multiBlankAnswers[index] ?? "___");
    const sentenceParts = displayExercise.sentence.split("___");
    const allFilled = answerSlots.every((entry) => entry !== "___");

    const submitMultiBlank = () => {
      if (answered || !allFilled) return;
      const given = answerSlots.map((entry) => entry.toLowerCase().trim());
      const expected = displayExercise.correct_answers.map((entry) => entry.toLowerCase().trim());
      const correct = given.every((value, index) => value === expected[index]);
      submitScore(correct ? 1 : 0);
    };

    const pickOption = (option: string) => {
      if (answered) return;
      setMultiBlankAnswers((previous) => {
        const next = [...previous];
        const insertionIndex = next.findIndex((value) => !value);
        const targetIndex = insertionIndex >= 0 ? insertionIndex : next.length;
        if (targetIndex >= blankCount) return next;
        next[targetIndex] = option;
        return next;
      });
    };

    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {sentenceParts.map((part, index) => (
            <span key={`${part}-${index}`}>
              {part}
              {index < blankCount && (
                <button
                  type="button"
                  disabled={answered}
                  onClick={() =>
                    setMultiBlankAnswers((previous) => {
                      const next = [...previous];
                      next.splice(index, 1);
                      return next;
                    })
                  }
                  className="mx-1 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm min-h-11"
                >
                  {answerSlots[index]}
                </button>
              )}
            </span>
          ))}
        </p>
        <div className="flex flex-wrap gap-2">
          {displayExercise.options.map((option) => (
            <Button key={option} variant="outline" className="min-h-11 transition-all duration-200 hover:-translate-y-0.5" disabled={answered} onClick={() => pickOption(option)}>
              {option}
            </Button>
          ))}
        </div>
        {!feedback && (
          <Button className="mt-4" disabled={!allFilled} onClick={submitMultiBlank}>
            Submit
          </Button>
        )}
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "scenario") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-200">{displayExercise.scenario}</p>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{displayExercise.question}</p>
        <div className="space-y-3">
          {displayExercise.options.map((opt, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start h-auto min-h-11 py-4 px-4 text-left whitespace-normal break-words transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50"
              disabled={answered}
              onClick={() => submitChoice(i)}
            >
              {opt}
            </Button>
          ))}
        </div>
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "spot_mistake") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-200">{displayExercise.scenario}</p>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{displayExercise.question}</p>
        <div className="space-y-3">
          {displayExercise.options.map((opt, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start h-auto min-h-11 py-4 px-4 text-left whitespace-normal break-words transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50"
              disabled={answered}
              onClick={() => submitChoice(i)}
            >
              {opt}
            </Button>
          ))}
        </div>
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "ordering") {
    const currentOrder = ordering.length > 0 ? ordering : orderingSeed;
    const move = (index: number, direction: -1 | 1) => {
      if (answered) return;
      const next = [...currentOrder];
      const target = index + direction;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      setOrdering(next);
    };
    const submitOrdering = () => {
      if (answered) return;
      const orderToCheck = ordering.length > 0 ? ordering : orderingSeed;
      const correct = orderToCheck.every((item, index) => item === displayExercise.correct_order[index]);
      submitScore(correct ? 1 : 0);
    };
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{displayExercise.prompt}</p>
        <div className="space-y-2">
          {currentOrder.map((itemIdx, index) => (
            <div key={itemIdx} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2 bg-white/60 dark:bg-gray-900/40">
              <span>{displayExercise.items[itemIdx]}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={answered || index === 0} onClick={() => move(index, -1)}>
                  Up
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={answered || index === currentOrder.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Down
                </Button>
              </div>
            </div>
          ))}
        </div>
        {!feedback && (
          <Button className="mt-4" onClick={submitOrdering}>
            Submit
          </Button>
        )}
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "numeric_slider" || displayExercise.kind === "apply_numeric") {
    const minAmount = 0;
    const maxAmount = 3000;
    const defaultValue = sliderValue ?? Math.round((displayExercise.min + displayExercise.max) / 2);
    const currentValue = Math.max(minAmount, Math.min(maxAmount, defaultValue));
    const inputValue = numericAmountInput ?? String(currentValue);
    const parsedAmount = Number(inputValue);
    const canSubmit = Number.isFinite(parsedAmount) && parsedAmount >= minAmount && parsedAmount <= maxAmount;
    const submitSlider = () => {
      if (answered || !canSubmit) return;
      const expected = inferNumericTarget(displayExercise);
      const tolerance = toFiniteNumber((displayExercise as { tolerance?: unknown }).tolerance) ?? 0;
      const correct = expected !== null && Math.abs(currentValue - expected) <= tolerance;
      submitScore(correct ? 1 : 0);
    };
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        {"scenario" in displayExercise && (
          <div className="rounded-xl bg-gray-100/80 dark:bg-gray-800/80 p-4 mb-4 border border-[var(--border)]">
            <p className="text-gray-700 dark:text-gray-200">{displayExercise.scenario}</p>
          </div>
        )}
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{displayExercise.prompt}</p>
        <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter amount
          <input
            type="number"
            min={minAmount}
            max={maxAmount}
            step={1}
            inputMode="numeric"
            value={inputValue}
            disabled={answered}
            onChange={(event) => {
              const raw = event.target.value;
              setNumericAmountInput(raw);
              if (raw.trim() === "") return;
              const parsed = Number(raw);
              if (!Number.isFinite(parsed)) return;
              const rounded = Math.round(parsed);
              if (rounded < minAmount || rounded > maxAmount) return;
              setSliderValue(rounded);
            }}
            className="mt-1 w-full rounded-md border p-3 bg-white dark:bg-gray-900 min-h-11"
          />
        </label>
        <input
          type="range"
          min={minAmount}
          max={maxAmount}
          value={currentValue}
          disabled={answered}
          onChange={(event) => {
            const next = Number(event.target.value);
            setSliderValue(next);
            setNumericAmountInput(String(next));
          }}
          className="w-full arcwealth-slider"
        />
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
          Selected: {currentValue} {displayExercise.unit_label ?? ""}
        </p>
        {!canSubmit && (
          <p className="text-xs mt-1 text-amber-500">Enter an amount between 0 and 3000 to submit.</p>
        )}
        {!feedback && (
          <Button className="mt-4" onClick={submitSlider} disabled={!canSubmit}>
            Submit
          </Button>
        )}
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "short_answer_ai") {
    const fallback = displayExercise.fallback_mcq;
    const submitFallbackChoice = (index: number) => {
      if (answered) return;
      setSelected(index);
      const correct = index === fallback.correct_index;
      submitScore(correct ? 1 : 0);
    };

    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{displayExercise.prompt}</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Choose the best answer (fallback mode).
        </p>
        <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">{fallback.question}</p>
        <div className="space-y-3">
          {fallback.options.map((option, index) => (
            <Button
              key={option}
              variant="outline"
              className="w-full justify-start h-auto min-h-11 py-4 px-4 text-left whitespace-normal break-words transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50"
              disabled={answered}
              onClick={() => submitFallbackChoice(index)}
              style={
                feedback && selected === index
                  ? feedback === "correct"
                    ? { borderColor: "var(--emerald-border)", backgroundColor: "rgba(16, 185, 129, 0.16)", color: "var(--text-primary)" }
                    : { borderColor: "var(--red-border)", backgroundColor: "rgba(239, 68, 68, 0.14)", color: "var(--text-primary)" }
                  : undefined
              }
            >
              {option}
            </Button>
          ))}
        </div>
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "apply_typed_inputs") {
    const values = typedInputs.length > 0 ? typedInputs : displayExercise.fields.map(() => "");
    const submitTypedInputs = () => {
      if (answered) return;
      const correct = displayExercise.fields.every((field, index) => {
        const got = (values[index] ?? "").trim().toLowerCase();
        const expected = field.correct_value.trim().toLowerCase();
        return got === expected;
      });
      submitScore(correct ? 1 : 0);
    };
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="rounded-xl bg-gray-100/80 dark:bg-gray-800/80 p-4 mb-4 border border-[var(--border)]">
          <p className="text-gray-700 dark:text-gray-200">{displayExercise.scenario}</p>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{displayExercise.prompt}</p>
        <div className="space-y-3">
          {displayExercise.fields.map((field, index) => (
            <label key={field.label} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              <input
                type="text"
                value={values[index] ?? ""}
                disabled={answered}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = event.target.value;
                  setTypedInputs(next);
                }}
                className="mt-1 w-full rounded-md border p-3 bg-white dark:bg-gray-900"
              />
            </label>
          ))}
        </div>
        {!feedback && (
          <Button className="mt-4" onClick={submitTypedInputs}>
            Submit
          </Button>
        )}
        {renderFeedback()}
      </div>
    );
  }

  if (displayExercise.kind === "match_pairs") {
    const isInteractionLocked = answered || matchLocked;
    const assignedRightIndices = new Set(Object.values(matchAssignments));
    const isFullyAssigned = Object.keys(matchAssignments).length === displayExercise.pairs.length;

    const evaluateMatches = (assignments: Record<number, number>) => {
      if (matchEvaluation) return;
      const result: Record<number, boolean> = {};
      for (let leftIndex = 0; leftIndex < displayExercise.pairs.length; leftIndex += 1) {
        result[leftIndex] = assignments[leftIndex] === leftIndex;
      }
      setMatchEvaluation(result);
      const matchesCorrect = Object.values(result).filter(Boolean).length;
      const totalMatches = displayExercise.pairs.length;
      const wrongMatches = Math.max(0, totalMatches - matchesCorrect);
      const credit = totalMatches > 0 ? 1 - wrongMatches / totalMatches : 0;
      submitScore(credit);
    };

    const attemptMatch = (leftIndex: number, rightIndex: number) => {
      if (isInteractionLocked) return;

      setMatchAssignments((prev) => {
        const next = { ...prev, [leftIndex]: rightIndex };
        if (Object.keys(next).length === displayExercise.pairs.length) {
          setMatchLocked(true);
          window.setTimeout(() => evaluateMatches(next), 120);
        }
        return next;
      });
      setSelectedLeftMatch(null);
    };

    return (
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">{displayExercise.prompt ?? "Match the pairs"}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Drag a left item onto its matching right item. You can also tap left, then tap right.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            {displayExercise.pairs.map((pair, leftIndex) => {
              const isSelected = selectedLeftMatch === leftIndex;
              const pairEvaluated = matchEvaluation?.[leftIndex];
              return (
                <button
                  key={`left-${leftIndex}`}
                  type="button"
                  draggable={!isInteractionLocked}
                  disabled={isInteractionLocked}
                  onClick={() => setSelectedLeftMatch(leftIndex)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(leftIndex));
                    event.dataTransfer.effectAllowed = "move";
                    setSelectedLeftMatch(leftIndex);
                  }}
                  onDragEnd={() => setSelectedLeftMatch(null)}
                  className={`w-full rounded-lg border px-3 py-2 text-left ${
                    pairEvaluated === true
                      ? "border-emerald-500 bg-emerald-100/70 dark:border-emerald-500/60 dark:bg-emerald-900/30"
                      : pairEvaluated === false
                        ? "border-red-400 bg-red-100/60 dark:border-red-500/60 dark:bg-red-950/30"
                      : isSelected
                      ? "border-sky-400 bg-sky-100/80 dark:bg-sky-900/30"
                      : "border-sky-200 bg-sky-50/70 dark:border-sky-800/60 dark:bg-sky-950/30"
                  } transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className="font-medium">{pair.left}</div>
                  {matchAssignments[leftIndex] !== undefined && (
                    <div className="mt-1 text-xs text-[var(--text-muted)]">
                      Matched with: {displayExercise.pairs[matchAssignments[leftIndex]]?.right}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {matchRightOrder.map((rightIndex) => {
              const pair = displayExercise.pairs[rightIndex];
              return (
                <button
                  key={`right-${rightIndex}`}
                  type="button"
                  disabled={isInteractionLocked}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const raw = event.dataTransfer.getData("text/plain");
                    const draggedLeft = Number(raw);
                    if (Number.isFinite(draggedLeft)) {
                      attemptMatch(draggedLeft, rightIndex);
                    }
                  }}
                  onClick={() => {
                    if (selectedLeftMatch === null) return;
                    attemptMatch(selectedLeftMatch, rightIndex);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left ${
                    assignedRightIndices.has(rightIndex)
                      ? "border-violet-400 bg-violet-100/80 dark:border-violet-600 dark:bg-violet-900/30"
                      : "border-violet-200 bg-violet-50/80 dark:border-violet-800/60 dark:bg-violet-950/30"
                  } transition-all duration-200 hover:-translate-y-0.5`}
                >
                  {pair.right}
                </button>
              );
            })}
          </div>
        </div>

        {!feedback && !isFullyAssigned && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Complete all matches to see detailed right/wrong feedback.</p>
        )}
        {matchEvaluation && (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-black/5 p-3 text-sm">
            <p className="font-medium text-[var(--text-primary)]">
              {Object.values(matchEvaluation).filter(Boolean).length}/{displayExercise.pairs.length} matches correct
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              This card gives partial credit: each correct match counts toward your score.
            </p>
          </div>
        )}
        {renderFeedback()}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">This question could not be displayed.</p>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        We hit an unsupported question format for this step. You can continue safely.
      </p>
      <Button className="min-h-11" onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}
