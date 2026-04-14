import { promises as fs } from "node:fs";
import path from "node:path";

import { type GeneratedLevel } from "./schema";
import { enforceWordLimit } from "./validator";

const CONTENT_BANK_PATH = path.resolve(process.cwd(), "arcwealth_level_content/arcwealth_level_content_part_1.md");
const DEFAULT_CHARACTERS = ["Priya", "Kai", "Sofia", "Marcus"];
const DEFAULT_LOCATIONS = ["Amsterdam", "London", "Singapore", "Berlin"];

function normalizeLessonArg(lessonArg: string): { moduleNumber: number; lessonNumber: number } {
  const topic = lessonArg.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (topic) return { moduleNumber: Number(topic[1]), lessonNumber: Number(topic[3]) };

  const moduleLesson = lessonArg.match(/^M(\d+)-L(\d+)$/i);
  if (moduleLesson) return { moduleNumber: Number(moduleLesson[1]), lessonNumber: Number(moduleLesson[2]) };

  const filename = path.basename(lessonArg).match(/^lesson_(\d+)\.md$/i);
  if (filename) return { moduleNumber: 1, lessonNumber: Number(filename[1]) };

  throw new Error(
    `Invalid lesson argument "${lessonArg}". Expected topic id (1.1.1), Mx-Ly (M1-L1), or lesson_<n>.md`
  );
}

function getLessonId(moduleNumber: number, lessonNumber: number): string {
  return `M${moduleNumber}-L${lessonNumber}`;
}

function getLessonBlock(contentBank: string, lessonId: string): { title: string; block: string } {
  const escaped = lessonId.replace("-", "\\-");
  const regex = new RegExp(
    `##\\s+${escaped}:\\s+(.+?)\\n\\n([\\s\\S]*?)(?=\\n##\\s+M\\d+\\-L\\d+:|\\n# MODULE|\\n\\*\\[Lessons M2\\-L2|\\n# DOCUMENT STRUCTURE NOTE|$)`,
    ""
  );
  const match = contentBank.match(regex);
  if (!match) throw new Error(`Could not find lesson block for ${lessonId}`);
  return { title: match[1].trim(), block: match[2].trim() };
}

function extractBetween(source: string, startLabel: string, endLabel: string): string {
  const start = source.indexOf(startLabel);
  if (start < 0) return "";
  const from = source.slice(start + startLabel.length);
  const end = from.indexOf(endLabel);
  return (end >= 0 ? from.slice(0, end) : from).trim();
}

function parseKeyValueLine(block: string, label: string): string {
  const line = block
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(label));
  return line ? line.replace(label, "").trim() : "";
}

function parseConceptCards(block: string): string[] {
  return [...block.matchAll(/\*\*Card \d+\*\*\n([\s\S]*?)(?=\n\*\*Card \d+\*\*|$)/g)]
    .map((match) => match[1].replace(/\n+/g, " ").trim())
    .filter(Boolean);
}

function getRawQuestions(section: string, prefix: string): string[] {
  const lines = section.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  const marker = new RegExp(`^\\*\\*${prefix}\\d+ \\[[A-Z]+\\]\\*\\*$`);

  for (const line of lines) {
    if (marker.test(line.trim())) {
      if (current.length > 0) blocks.push(current.join("\n").trim());
      current = [line];
    } else if (current.length > 0) {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join("\n").trim());
  return blocks;
}

function parseOptions(block: string): { options: string[]; correctIndex: number } {
  const optionLines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^-\s*[A-D]\)/.test(line));
  const options = optionLines.map((line) =>
    line
      .replace(/^-\s*[A-D]\)\s*/, "")
      .replace(/[✓✗]/g, "")
      .trim()
  );
  const correctIndex = optionLines.findIndex((line) => line.includes("✓"));
  return { options, correctIndex: correctIndex >= 0 ? correctIndex : 0 };
}

function parsePairs(block: string): Array<{ left: string; right: string }> {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") && line.includes("→"))
    .map((line) => {
      const [left, right] = line.replace(/^- /, "").split("→").map((item) => item.trim());
      return { left, right };
    })
    .filter((pair) => pair.left && pair.right);
}

function parseWordBank(block: string): string[] {
  const line = block
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("Word bank:"));
  return line ? [...line.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1].trim()).filter(Boolean) : [];
}

function parseCorrectTokens(block: string): string[] {
  const line = block
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => /^Correct:/i.test(entry));
  if (!line) return [];
  return line
    .replace(/^Correct:\s*/i, "")
    .split(/\+|,|or/gi)
    .map((value) => value.trim())
    .filter(Boolean);
}

function firstContentLine(block: string): string {
  return (
    block
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith("**")) ?? ""
  );
}

function extractExplanation(block: string): string {
  const line = block
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => /^(Explanation:|Because:|\*Feedback)/i.test(entry));
  if (!line) return "Review the concept and try again.";
  return line.replace(/^\*?Feedback.*?:\*?\s*/i, "").replace(/^Explanation:\s*/i, "").replace(/^Because:\s*/i, "").trim();
}

function parseNumericFromText(value: string): number | null {
  const first = value.match(/-?\d[\d,]*(?:\.\d+)?/)?.[0] ?? "";
  const number = Number(first.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

export interface ParsedLessonContext {
  lessonId: string;
  lessonFile: string;
  lessonPath: string;
  markdown: string;
  moduleNumber: number;
  lessonNumber: number;
  topicId: string;
  lessonTitle: string;
  keyTerm: string;
  oneLineConcept: string;
  hookFact: string;
  hookQuestion: string;
  conceptCards: string[];
  checkBlocks: string[];
  applyBlocks: string[];
  lockInTakeaway: string;
}

function normalizeCheckQuestionOrder(
  questions: GeneratedLevel["check"]["questions"]
): GeneratedLevel["check"]["questions"] {
  const queue = [...questions];
  const take = (predicate: (question: GeneratedLevel["check"]["questions"][number]) => boolean) => {
    const index = queue.findIndex(predicate);
    if (index < 0) return null;
    return queue.splice(index, 1)[0];
  };

  const ordered: GeneratedLevel["check"]["questions"] = [];
  const first = take((question) => question.type === "multiple_choice");
  if (first) ordered.push(first);

  const second = take((question) => question.type === "true_false_why");
  if (second) ordered.push(second);

  const third = take((question) => question.type === "match_pairs" || question.type === "ordering");
  if (third) ordered.push(third);

  const penultimate = take((question) => question.type === "multi_blank");
  const final = take((question) => question.type === "spot_mistake") ?? take((question) => question.type === "fill_blank");

  ordered.push(...queue);
  if (penultimate) ordered.push(penultimate);
  if (final) ordered.push(final);

  return ordered.slice(0, 8);
}

function parseChecklistQuestion(
  block: string,
  keyTerm: string
): GeneratedLevel["check"]["questions"][number] | null {
  const marker = block.match(/\[(\w+)\]\*\*$/m)?.[1]?.toUpperCase();
  const prompt = firstContentLine(block);
  const explanation = enforceWordLimit(extractExplanation(block), 50);
  const feedbackCorrect = "Nice work.";
  const feedbackWrong = "Not quite. Try again.";

  if (marker === "MC" || marker === "SPOT" || marker === "BRANCH") {
    const parsed = parseOptions(block);
    if (parsed.options.length !== 4) return null;
    if (marker === "SPOT") {
      return {
        type: "spot_mistake",
        scenario: enforceWordLimit(prompt, 40),
        prompt: "What is the main mistake?",
        options: parsed.options.map((option) => enforceWordLimit(option, 12)),
        correctIndex: parsed.correctIndex,
        feedbackCorrect,
        feedbackWrong,
        explanation,
      };
    }
    return {
      type: "multiple_choice",
      prompt: enforceWordLimit(prompt, 30),
      options: parsed.options.map((option) => enforceWordLimit(option, 12)),
      correctIndex: parsed.correctIndex,
      feedbackCorrect,
      feedbackWrong,
      explanation,
    };
  }

  if (marker === "TF") {
    const statementLine =
      block
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.startsWith("Statement:")) ?? prompt;
    const answerLine = block
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("Answer:"));
    return {
      type: "true_false_why",
      statement: enforceWordLimit(statementLine.replace(/^Statement:\s*/i, "").replace(/^["“]|["”]$/g, ""), 25),
      correct: /TRUE/i.test(answerLine ?? ""),
      whyPrompt: "Why is that true or false?",
      feedbackCorrect,
      feedbackWrong,
      explanation,
    };
  }

  if (marker === "MATCH") {
    const pairs = parsePairs(block).slice(0, 4);
    if (pairs.length < 3) return null;
    return {
      type: "match_pairs",
      prompt: enforceWordLimit(prompt || "Match the terms", 20),
      pairs: pairs.map((pair) => ({
        left: enforceWordLimit(pair.left, 8),
        right: enforceWordLimit(pair.right, 10),
      })),
      feedbackCorrect,
      feedbackWrong,
      explanation,
    };
  }

  if (marker === "BLANK") {
    const sentenceLine =
      block
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.includes("______") || line.includes("___")) ?? prompt;
    let normalizedSentence = sentenceLine.replace(/______+/g, "___");
    let blankCount = (normalizedSentence.match(/___/g) ?? []).length;
    const options = parseWordBank(block).slice(0, 6);
    const correctTokens = parseCorrectTokens(block);
    if (blankCount === 0) {
      const fallbackBlankCount = Math.min(4, Math.max(1, correctTokens.length));
      normalizedSentence = `${normalizedSentence} ${Array.from({ length: fallbackBlankCount }).map(() => "___").join(" ")}`.trim();
      blankCount = fallbackBlankCount;
    }
    if (blankCount >= 2) {
      if (options.length < 5) return null;
      const correctAnswers =
        correctTokens.length >= blankCount
          ? correctTokens.slice(0, blankCount).map((token) => {
              const cleaned = token.toLowerCase().replace(/[^a-z0-9 ]/gi, " ").trim();
              const match = options.find((option) => cleaned.includes(option.toLowerCase()) || option.toLowerCase().includes(cleaned));
              return match ?? token;
            })
          : options.slice(0, blankCount);
      return {
        type: "multi_blank",
        sentence: normalizedSentence,
        options: options.map((option) => enforceWordLimit(option, 6)),
        correctAnswers: correctAnswers.map((answer) => enforceWordLimit(answer, 12)),
        keyTerm: enforceWordLimit(keyTerm, 6),
        feedbackCorrect,
        feedbackWrong,
        explanation,
      };
    }
    if (options.length < 4) return null;
    const normalizedOptions = options.slice(0, 4).map((option) => enforceWordLimit(option, 12));
    const explicitCorrect = correctTokens[0];
    const correctIndex = explicitCorrect ? Math.max(0, normalizedOptions.findIndex((option) => option.includes(explicitCorrect))) : 0;
    return {
      type: "fill_blank",
      sentence: normalizedSentence,
      options: normalizedOptions,
      correctIndex,
      keyTerm: enforceWordLimit(keyTerm, 6),
      feedbackCorrect,
      feedbackWrong,
      explanation,
    };
  }

  if (marker === "ORDER") {
    const orderLine =
      block
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.startsWith("Correct order:")) ?? "";
    const items = orderLine
      .replace(/^Correct order:\s*/i, "")
      .split("→")
      .map((item) => item.trim())
      .filter(Boolean);
    if (items.length < 4) return null;
    const capped = items.slice(0, 5);
    return {
      type: "ordering",
      prompt: enforceWordLimit(prompt || "Order the items correctly", 25),
      items: capped.map((item) => enforceWordLimit(item, 8)),
      correctOrder: capped.map((_, index) => index),
      feedbackCorrect,
      feedbackWrong,
      explanation,
    };
  }

  if (marker === "SLIDER") {
    const rangeLine =
      block
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.startsWith("Range:")) ?? "";
    const correctLine = rangeLine.match(/Correct:\s*([^|]+)/i)?.[1]?.trim() ?? "";
    const [minRaw, maxRaw] = rangeLine
      .replace(/^Range:\s*/i, "")
      .split("|")[0]
      ?.split("–")
      .map((entry) => entry.trim()) ?? ["0", "100"];
    const min = parseNumericFromText(minRaw) ?? 0;
    const max = parseNumericFromText(maxRaw) ?? min + 100;
    const correctValue = parseNumericFromText(correctLine) ?? Math.round((min + max) / 2);
    const unit = rangeLine.match(/[€$£¥]/)?.[0] ?? "value";
    return {
      type: "numeric_slider",
      prompt: enforceWordLimit(prompt, 25),
      min,
      max,
      correctValue,
      tolerance: Math.max(1, Math.round(Math.abs(correctValue) * 0.1)),
      unitLabel: enforceWordLimit(unit, 6),
      feedbackCorrect,
      feedbackWrong,
      explanation,
    };
  }

  return null;
}

function detectLocation(block: string, fallbackLocation: string): string {
  const knownLocations = [
    "Amsterdam",
    "London",
    "Singapore",
    "Berlin",
    "UK",
    "US",
    "USA",
    "Netherlands",
    "Germany",
    "Hong Kong",
    "Japan",
    "France",
    "Ireland",
  ];
  const lower = block.toLowerCase();
  const found = knownLocations.find((location) => lower.includes(location.toLowerCase()));
  return found ?? fallbackLocation;
}

function parseApplyTask(
  block: string,
  fallbackCharacter: string,
  fallbackLocation: string,
  difficulty: "moderate" | "hard"
): GeneratedLevel["apply"]["tasks"][number] | null {
  const marker = block.match(/\[(\w+)\]\*\*$/m)?.[1]?.toUpperCase() ?? "BRANCH";
  const parsed = parseOptions(block);
  const bracketOptions = [...block.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1].trim()).filter(Boolean);
  const uniqueBracketOptions = Array.from(new Set(bracketOptions));

  let options = parsed.options;
  let correctIndex = parsed.correctIndex;
  if (options.length !== 4) {
    options = uniqueBracketOptions.slice(0, 4);
    if (options.length < 4) {
      const correctText =
        block
          .split("\n")
          .map((line) => line.trim())
          .find((line) => /^Correct:/i.test(line))
          ?.replace(/^Correct:\s*/i, "")
          .split("|")[0]
          .trim() ?? "Best supported answer";
      options = [correctText, "Too optimistic plan", "Too risky assumption", "Missing key constraints"].slice(0, 4);
    }
    const explicitCorrect = block
      .split("\n")
      .map((line) => line.trim())
      .find((line) => /^Correct:/i.test(line))
      ?.replace(/^Correct:\s*/i, "")
      .split("|")[0]
      .trim();
    correctIndex = explicitCorrect ? Math.max(0, options.findIndex((opt) => opt.includes(explicitCorrect))) : 0;
  }

  const taskTypeByMarker: Record<string, GeneratedLevel["apply"]["tasks"][number]["taskType"]> = {
    BUILD: "build_plan",
    BRANCH: "decision_branch",
    RANK: "ranking",
    CALC: "budget_calculator",
    MISTAKE: "spot_mistake",
    SLIDER: "budget_calculator",
  };
  const scenario = firstContentLine(block);
  const character = DEFAULT_CHARACTERS.find((candidate) => new RegExp(`\\b${candidate}\\b`, "i").test(block)) ?? fallbackCharacter;
  const taskType = taskTypeByMarker[marker] ?? "decision_branch";
  const location = detectLocation(block, fallbackLocation);
  const prompt =
    block
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.endsWith("?") && !line.startsWith("-")) ?? "Choose the best decision.";

  if (taskType === "budget_calculator") {
    const rangeLine =
      block
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.startsWith("Range:")) ?? "";
    const correctLine = rangeLine.match(/Correct:\s*([^|]+)/i)?.[1]?.trim() ?? "";
    const [minRaw, maxRaw] = rangeLine
      .replace(/^Range:\s*/i, "")
      .split("|")[0]
      ?.split(/[–-]/)
      .map((entry) => entry.trim()) ?? ["0", "100"];
    const min = parseNumericFromText(minRaw) ?? 0;
    const max = parseNumericFromText(maxRaw) ?? Math.max(100, min + 100);
    const correctValue = parseNumericFromText(correctLine) ?? Math.round((min + max) / 2);
    const tolerance = parseNumericFromText(rangeLine.match(/\(±([^)]*)\)/)?.[1] ?? "") ?? Math.max(1, Math.round(Math.abs(correctValue) * 0.1));
    const unit = rangeLine.match(/[€$£¥]/)?.[0] ?? "value";
    return {
      taskType,
      difficulty,
      character: enforceWordLimit(character, 3),
      location: enforceWordLimit(location, 8),
      scenario: enforceWordLimit(scenario, 70),
      prompt: enforceWordLimit(prompt, 25),
      explanation: enforceWordLimit(extractExplanation(block), 50),
      answerMode: "numeric",
      min,
      max,
      correctValue,
      tolerance,
      unitLabel: enforceWordLimit(unit, 6),
    };
  }

  if (taskType === "build_plan") {
    const inputLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^-\s*.+(?::|=)\s*_{3,}/.test(line))
      .slice(0, 6);
    const correctTokens = parseCorrectTokens(block);
    const inputFields = inputLines.map((line, index) => {
      const label = line.replace(/^-\s*/, "").replace(/(?::|=)\s*_{3,}.*/g, "").trim();
      const correctValue = correctTokens[index] ?? "0";
      return {
        label: enforceWordLimit(label, 20),
        correctValue: enforceWordLimit(correctValue, 12),
      };
    });
    if (inputFields.length < 2) {
      return {
        taskType: "decision_branch",
        difficulty,
        character: enforceWordLimit(character, 3),
        location: enforceWordLimit(location, 8),
        scenario: enforceWordLimit(scenario, 70),
        prompt: enforceWordLimit(prompt, 25),
        options: options.slice(0, 4).map((option) => enforceWordLimit(option, 12)),
        correctIndex: Math.max(0, Math.min(options.length - 1, correctIndex)),
        explanation: enforceWordLimit(extractExplanation(block), 50),
        answerMode: "choice",
      };
    }
    return {
      taskType,
      difficulty,
      character: enforceWordLimit(character, 3),
      location: enforceWordLimit(location, 8),
      scenario: enforceWordLimit(scenario, 70),
      prompt: enforceWordLimit(prompt, 25),
      explanation: enforceWordLimit(extractExplanation(block), 50),
      answerMode: "typed_inputs",
      inputFields,
    };
  }

  return {
    taskType,
    difficulty,
    character: enforceWordLimit(character, 3),
    location: enforceWordLimit(location, 8),
    scenario: enforceWordLimit(scenario, 70),
    prompt: enforceWordLimit(prompt, 25),
    options: options.slice(0, 4).map((option) => enforceWordLimit(option, 12)),
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: enforceWordLimit(extractExplanation(block), 50),
    answerMode: "choice",
  };
}

export async function loadLessonContext(lessonArg: string): Promise<ParsedLessonContext> {
  const { moduleNumber, lessonNumber } = normalizeLessonArg(lessonArg);
  const lessonId = getLessonId(moduleNumber, lessonNumber);
  const contentBank = await fs.readFile(CONTENT_BANK_PATH, "utf8");
  const lesson = getLessonBlock(contentBank, lessonId);

  const keyTerm = parseKeyValueLine(lesson.block, "**Key term:**");
  const oneLineConcept = parseKeyValueLine(lesson.block, "**One-line concept:**");
  const hookSection = extractBetween(lesson.block, "### Hook", "### Concept Cards");
  const hookLines = hookSection
    .split("\n")
    .map((line) => line.replace(/^>\s*/, "").replace(/^["“]|["”]$/g, "").replace(/^\*|\*$/g, "").trim())
    .filter(Boolean);
  const conceptSection = extractBetween(lesson.block, "### Concept Cards", "### Check Questions");
  const checkSection = extractBetween(lesson.block, "### Check Questions", "### Apply Tasks");
  const applySection = extractBetween(lesson.block, "### Apply Tasks", "### Lock-in");
  const lockInSection = lesson.block.split("### Lock-in")[1] ?? "";

  return {
    lessonId,
    lessonFile: path.basename(CONTENT_BANK_PATH),
    lessonPath: CONTENT_BANK_PATH,
    markdown: lesson.block,
    moduleNumber,
    lessonNumber,
    topicId: `${moduleNumber}.1.${lessonNumber}`,
    lessonTitle: lesson.title,
    keyTerm,
    oneLineConcept,
    hookFact: hookLines[0] ?? `This lesson introduces ${keyTerm}.`,
    hookQuestion: hookLines[1] ?? `Why does ${keyTerm} matter?`,
    conceptCards: parseConceptCards(conceptSection),
    checkBlocks: getRawQuestions(checkSection, `${lessonId}-CK`),
    applyBlocks: getRawQuestions(applySection, `${lessonId}-AP`),
    lockInTakeaway: parseKeyValueLine(lockInSection, "**Takeaway:**"),
  };
}

export function buildDeterministicLevel(context: ParsedLessonContext): GeneratedLevel {
  const fallbackCharacter = DEFAULT_CHARACTERS[(context.lessonNumber - 1) % DEFAULT_CHARACTERS.length];
  const fallbackLocation = DEFAULT_LOCATIONS[(context.lessonNumber - 1) % DEFAULT_LOCATIONS.length];

  const checkQuestions = context.checkBlocks
    .map((block) => parseChecklistQuestion(block, context.keyTerm))
    .filter((question): question is NonNullable<typeof question> => question !== null)
    .slice(0, 8);
  const normalizedCheckQuestions = normalizeCheckQuestionOrder(checkQuestions);
  for (const question of normalizedCheckQuestions) {
    if (question.type === "multi_blank") {
      question.correctAnswers = question.correctAnswers.map((answer, index) => {
        const cleaned = answer.toLowerCase().replace(/[^a-z0-9 ]/gi, " ").trim();
        const matched = question.options.find(
          (option) =>
            option.toLowerCase() === cleaned ||
            option.toLowerCase().includes(cleaned) ||
            cleaned.includes(option.toLowerCase())
        );
        return matched ?? question.options[index] ?? question.options[0];
      });
    }
    if (question.type === "numeric_slider") {
      if (question.max < question.min) {
        question.max = question.min + 100;
      }
      if (question.correctValue < question.min) question.correctValue = question.min;
      if (question.correctValue > question.max) question.correctValue = question.max;
    }
  }
  if (!normalizedCheckQuestions.some((question) => question.type === "multi_blank")) {
    const fillIndex = normalizedCheckQuestions.findIndex((question) => question.type === "fill_blank");
    if (fillIndex >= 0) {
      const fill = normalizedCheckQuestions[fillIndex];
      if (fill.type === "fill_blank") {
        const sentence = `${fill.sentence} ___`;
        const options = Array.from(new Set([...fill.options, fill.options[0], fill.options[1] ?? fill.options[0], "buffer"])).slice(
          0,
          6
        );
        normalizedCheckQuestions[fillIndex] = {
          type: "multi_blank",
          sentence,
          options,
          correctAnswers: [fill.options[fill.correctIndex], fill.options[fill.correctIndex]],
          keyTerm: fill.keyTerm,
          feedbackCorrect: fill.feedbackCorrect,
          feedbackWrong: fill.feedbackWrong,
          explanation: fill.explanation,
        };
      }
    }
  }
  for (let index = 1; index < normalizedCheckQuestions.length; index += 1) {
    if (normalizedCheckQuestions[index].type === normalizedCheckQuestions[index - 1].type) {
      const swapIndex = normalizedCheckQuestions.findIndex(
        (question, candidateIndex) => candidateIndex > index && question.type !== normalizedCheckQuestions[index].type
      );
      if (swapIndex > index) {
        const temp = normalizedCheckQuestions[index];
        normalizedCheckQuestions[index] = normalizedCheckQuestions[swapIndex];
        normalizedCheckQuestions[swapIndex] = temp;
      }
    }
  }
  const applyTasks = context.applyBlocks
    .map((block, index) => parseApplyTask(block, fallbackCharacter, fallbackLocation, index === 0 ? "moderate" : "hard"))
    .filter((task): task is NonNullable<typeof task> => task !== null)
    .slice(0, 2);

  if (normalizedCheckQuestions.length < 6) {
    throw new Error(`Lesson ${context.lessonId} has insufficient parsed check questions (${normalizedCheckQuestions.length})`);
  }
  if (applyTasks.length !== 2) {
    throw new Error(`Lesson ${context.lessonId} must provide exactly 2 apply tasks`);
  }
  if (applyTasks[0].taskType === applyTasks[1].taskType && applyTasks[1].answerMode === "choice") {
    applyTasks[1] = { ...applyTasks[1], taskType: applyTasks[1].taskType === "ranking" ? "decision_branch" : "ranking" };
  }

  return {
    schemaVersion: "2.0",
    sourceLessonFile: context.lessonFile,
    topicId: context.topicId,
    moduleNumber: context.moduleNumber,
    lessonNumber: context.lessonNumber,
    lessonTitle: context.lessonTitle,
    concept: context.oneLineConcept || context.keyTerm,
    estimatedDurationSeconds: 290,
    sectionOrder: ["hook", "concept", "check", "apply", "lock_in"],
    hook: {
      fact: enforceWordLimit(context.hookFact, 25),
      question: enforceWordLimit(context.hookQuestion, 25),
    },
    conceptCards: context.conceptCards.slice(0, 7).map((card, index, allCards) => ({
      title: enforceWordLimit(`Card ${index + 1}`, 8),
      body: enforceWordLimit(index === allCards.length - 1 ? `Now test this: ${card}` : card, 40),
    })),
    check: {
      questions: normalizedCheckQuestions,
    },
    apply: {
      tasks: [applyTasks[0], applyTasks[1]],
    },
    lockIn: {
      keyTerm: enforceWordLimit(context.keyTerm, 6),
      takeaway: enforceWordLimit(context.lockInTakeaway || `${context.keyTerm} guides smarter financial choices.`, 20),
      continueLabel: "Continue",
    },
    xp: {
      base: 10,
      perCheckFirstTryCorrect: 2,
      perApplyFirstTryCorrect: 3,
      perfectRunBonus: 5,
    },
    reviewQueueEntry: {
      keyTerm: context.keyTerm,
      definition: enforceWordLimit(`${context.keyTerm} anchors better education money decisions.`, 16),
      moduleId: `module_${context.moduleNumber}`,
      quickRecallPrompt: enforceWordLimit(`What does ${context.keyTerm} include beyond tuition?`, 20),
    },
    ui: {
      colorTokens: {
        keyTerm: "var(--amber-fill)",
        correct: "var(--emerald-fill)",
        wrong: "var(--red-fill)",
        cta: "var(--indigo-fill)",
      },
      animations: {
        maxDurationMs: 400,
        xpCounterDurationMs: 600,
        usesReducedMotionFallback: true,
      },
    },
  };
}
