import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

import type { LessonExercise } from "../../types/curriculum";
import type { Database } from "../../types/database";
import type { GeneratedLevel } from "./schema";

export interface PersistOptions {
  noDb?: boolean;
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function assertNoError(error: unknown, context: string): asserts error is null | undefined {
  if (!error) return;
  throw new Error(`${context}: ${formatUnknownError(error)}`);
}

function toLessonExercise(question: GeneratedLevel["check"]["questions"][number]): LessonExercise {
  switch (question.type) {
    case "multiple_choice":
      return {
        kind: "multiple_choice",
        question: question.prompt,
        options: question.options,
        correct_index: question.correctIndex,
        explanation: question.explanation,
      };
    case "true_false_why":
      return {
        kind: "true_false",
        statement: question.statement,
        correct: question.correct,
        explanation: `${question.explanation} ${question.whyPrompt}`,
      };
    case "fill_blank":
      return {
        kind: "fill_blank",
        sentence: question.sentence,
        options: question.options,
        correct_index: question.correctIndex,
        explanation: question.explanation,
      };
    case "multi_blank":
      return {
        kind: "multi_blank",
        sentence: question.sentence,
        options: question.options,
        correct_answers: question.correctAnswers,
        explanation: question.explanation,
      };
    case "match_pairs":
      return {
        kind: "match_pairs",
        prompt: question.prompt,
        pairs: question.pairs,
        explanation: question.explanation,
      };
    case "ordering":
      return {
        kind: "ordering",
        prompt: question.prompt,
        items: question.items,
        correct_order: question.correctOrder,
        explanation: question.explanation,
      };
    case "numeric_slider":
      return {
        kind: "numeric_slider",
        prompt: question.prompt,
        min: question.min,
        max: question.max,
        correct_value: question.correctValue,
        tolerance: question.tolerance,
        unit_label: question.unitLabel,
        explanation: question.explanation,
      };
    case "spot_mistake":
      return {
        kind: "spot_mistake",
        scenario: question.scenario,
        question: question.prompt,
        options: question.options,
        correct_index: question.correctIndex,
        explanation: question.explanation,
      };
  }
}

function toApplyExercise(task: GeneratedLevel["apply"]["tasks"][number]): LessonExercise {
  if (task.answerMode === "numeric") {
    return {
      kind: "apply_numeric",
      scenario: task.scenario,
      prompt: task.prompt,
      min: task.min,
      max: task.max,
      correct_value: task.correctValue,
      tolerance: task.tolerance,
      unit_label: task.unitLabel,
      explanation: task.explanation,
      character: task.character,
      location: task.location,
    };
  }
  if (task.answerMode === "typed_inputs") {
    return {
      kind: "apply_typed_inputs",
      scenario: task.scenario,
      prompt: task.prompt,
      fields: task.inputFields.map((field) => ({
        label: field.label,
        correct_value: field.correctValue,
      })),
      explanation: task.explanation,
      character: task.character,
      location: task.location,
    };
  }
  return {
    kind: "scenario",
    scenario: task.scenario,
    question: task.prompt,
    options: task.options,
    correct_index: task.correctIndex,
    explanation: task.explanation,
    character: task.character,
    location: task.location,
  };
}

function toDuolingoLesson(level: GeneratedLevel): {
  type: "duolingo_lesson";
  exercises: LessonExercise[];
  level: {
    hook: GeneratedLevel["hook"];
    conceptCards: GeneratedLevel["conceptCards"];
    check: { questions: LessonExercise[] };
    apply: { tasks: LessonExercise[] };
    lockIn: GeneratedLevel["lockIn"];
    reviewQueueEntry: GeneratedLevel["reviewQueueEntry"];
    xp: GeneratedLevel["xp"];
    ui: GeneratedLevel["ui"];
  };
} {
  const exercises: LessonExercise[] = [
    ...level.check.questions.map((question) => toLessonExercise(question)),
    ...level.apply.tasks.map((task) => toApplyExercise(task)),
  ];
  return {
    type: "duolingo_lesson",
    exercises,
    level: {
      hook: level.hook,
      conceptCards: level.conceptCards,
      check: { questions: level.check.questions.map((question) => toLessonExercise(question)) },
      apply: { tasks: level.apply.tasks.map((task) => toApplyExercise(task)) },
      lockIn: level.lockIn,
      reviewQueueEntry: level.reviewQueueEntry,
      xp: level.xp,
      ui: level.ui,
    },
  };
}

function toQuizPayload(level: GeneratedLevel) {
  return {
    type: "quiz",
    questions: toDuolingoLesson(level).exercises,
  };
}

async function writeArtifact(level: GeneratedLevel): Promise<string> {
  const outDir = path.join(process.cwd(), "generated", "levels");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${level.topicId.replace(/\./g, "_")}.level.json`);
  await fs.writeFile(outPath, `${JSON.stringify(level, null, 2)}\n`, "utf8");
  return outPath;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRole) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function upsertTopicIfMissing(client: ReturnType<typeof getAdminClient>, level: GeneratedLevel) {
  const existing = await client
    .from("topics")
    .select("id")
    .eq("topic_id", level.topicId)
    .maybeSingle();

  assertNoError(existing.error, "Failed checking existing topic");
  if (existing.data) return;

  const insertRes = await client.from("topics").insert({
    topic_id: level.topicId,
    level_number: level.moduleNumber,
    section_number: 1,
    lesson_number: level.lessonNumber,
    title: level.lessonTitle,
    description: level.hook.fact,
    topic_type: "lesson",
    xp_reward: level.xp.base + level.xp.perfectRunBonus,
    order_index: level.moduleNumber * 100 + level.lessonNumber,
  });
  assertNoError(insertRes.error, "Failed inserting topic");
}

async function upsertLessonContent(
  client: ReturnType<typeof getAdminClient>,
  topicId: string,
  contentType: "duolingo_lesson" | "quiz",
  content: Database["public"]["Tables"]["lesson_content"]["Insert"]["content"]
) {
  const deleteRes = await client
    .from("lesson_content")
    .delete()
    .eq("topic_id", topicId)
    .eq("content_type", contentType);
  assertNoError(deleteRes.error, `Failed cleaning existing lesson_content (${contentType})`);

  const insertRes = await client.from("lesson_content").insert({
    topic_id: topicId,
    content_type: contentType,
    content,
  });
  assertNoError(insertRes.error, `Failed inserting lesson_content (${contentType})`);
}

async function persistToDatabase(level: GeneratedLevel) {
  const client = getAdminClient();
  await upsertTopicIfMissing(client, level);
  await upsertLessonContent(client, level.topicId, "duolingo_lesson", toDuolingoLesson(level));
  await upsertLessonContent(client, level.topicId, "quiz", toQuizPayload(level));
}

export async function persistGeneratedLevel(level: GeneratedLevel, options: PersistOptions = {}) {
  const artifactPath = await writeArtifact(level);

  if (!options.noDb) {
    await persistToDatabase(level);
  }

  return {
    artifactPath,
    dbWritten: !options.noDb,
  };
}
