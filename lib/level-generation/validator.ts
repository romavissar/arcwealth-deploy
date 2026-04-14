import { GeneratedLevelSchema, type GeneratedLevel, wordCount } from "./schema";

const GUIDE_ERRORS = {
  sectionOrder: "Section order must be hook -> concept -> check -> apply -> lock_in.",
  checkStart: "Check section must start with multiple_choice.",
  checkEnd: "Check section must end with fill_blank or spot_mistake.",
  checkConsecutive: "Check section cannot contain consecutive duplicate question types.",
  checkCoverage: "Check section must include at least one match_pairs or ordering question.",
  checkMultiBlank: "Check section must include at least one multi_blank question.",
  applyTasks: "Apply section must contain exactly 2 tasks.",
  applyDifficulty: "Apply task 1 must be moderate and task 2 must be hard.",
  applyMode: "Apply task answer mode must match task type requirements.",
  conceptBridge: "Final concept card should bridge into check comprehension.",
};

export function validateGeneratedLevel(levelInput: unknown): GeneratedLevel {
  const parsed = GeneratedLevelSchema.safeParse(levelInput);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Generated level failed schema validation:\n${issues}`);
  }

  const level = parsed.data;
  const ruleViolations: string[] = [];

  if (level.sectionOrder.join("|") !== "hook|concept|check|apply|lock_in") {
    ruleViolations.push(GUIDE_ERRORS.sectionOrder);
  }

  const checkTypes = level.check.questions.map((question) => question.type);
  if (checkTypes[0] !== "multiple_choice") {
    ruleViolations.push(GUIDE_ERRORS.checkStart);
  }

  const checkLast = checkTypes[checkTypes.length - 1];
  if (checkLast !== "fill_blank" && checkLast !== "spot_mistake") {
    ruleViolations.push(GUIDE_ERRORS.checkEnd);
  }

  for (let i = 1; i < checkTypes.length; i += 1) {
    if (checkTypes[i] === checkTypes[i - 1]) {
      ruleViolations.push(GUIDE_ERRORS.checkConsecutive);
      break;
    }
  }

  if (!checkTypes.includes("match_pairs") && !checkTypes.includes("ordering")) {
    ruleViolations.push(GUIDE_ERRORS.checkCoverage);
  }

  if (!checkTypes.includes("multi_blank")) {
    ruleViolations.push(GUIDE_ERRORS.checkMultiBlank);
  }

  if (level.apply.tasks.length !== 2) {
    ruleViolations.push(GUIDE_ERRORS.applyTasks);
  } else {
    const [taskOne, taskTwo] = level.apply.tasks;
    if (taskOne.difficulty !== "moderate" || taskTwo.difficulty !== "hard") {
      ruleViolations.push(GUIDE_ERRORS.applyDifficulty);
    }
    if (taskOne.taskType === taskTwo.taskType) {
      ruleViolations.push("Apply task 1 and task 2 cannot use the same task type.");
    }
    for (const task of level.apply.tasks) {
      if (task.taskType === "budget_calculator" && task.answerMode !== "numeric") {
        ruleViolations.push(GUIDE_ERRORS.applyMode);
        break;
      }
      if (task.taskType === "build_plan" && task.answerMode !== "typed_inputs") {
        ruleViolations.push(GUIDE_ERRORS.applyMode);
        break;
      }
      if (
        (task.taskType === "decision_branch" || task.taskType === "ranking" || task.taskType === "spot_mistake") &&
        task.answerMode !== "choice"
      ) {
        ruleViolations.push(GUIDE_ERRORS.applyMode);
        break;
      }
      if (task.answerMode === "choice" && task.correctIndex >= task.options.length) {
        ruleViolations.push("Apply choice task correct index is out of range.");
        break;
      }
      if (task.answerMode === "numeric" && (task.correctValue < task.min || task.correctValue > task.max)) {
        ruleViolations.push("Apply numeric task correct value must stay within min/max.");
        break;
      }
    }
  }

  const finalConceptCard = level.conceptCards[level.conceptCards.length - 1];
  if (!/check|test|question|recall/i.test(finalConceptCard.body)) {
    ruleViolations.push(GUIDE_ERRORS.conceptBridge);
  }

  const checks = level.check.questions.flatMap((question) => [question.feedbackCorrect, question.feedbackWrong]);
  const overCap = checks.filter((text, index) => wordCount(text) > (index % 2 === 0 ? 8 : 15));
  if (overCap.length > 0) {
    ruleViolations.push("Feedback word limits exceeded.");
  }

  for (const question of level.check.questions) {
    if (question.type === "ordering") {
      if (question.correctOrder.length !== question.items.length) {
        ruleViolations.push("Ordering question correct order length must match item length.");
        break;
      }
      const sorted = [...question.correctOrder].sort((a, b) => a - b);
      const expected = question.items.map((_, index) => index);
      if (sorted.some((value, index) => value !== expected[index])) {
        ruleViolations.push("Ordering question correct order must be a full permutation of item indexes.");
        break;
      }
    }
    if (question.type === "numeric_slider" && (question.correctValue < question.min || question.correctValue > question.max)) {
      ruleViolations.push("Numeric slider correct value must stay within min/max.");
      break;
    }
    if (question.type === "multi_blank") {
      const blankCount = (question.sentence.match(/___/g) ?? []).length;
      if (blankCount !== question.correctAnswers.length) {
        ruleViolations.push("Multi-blank question must provide one correct answer per blank.");
        break;
      }
      if (!question.correctAnswers.every((answer) => question.options.includes(answer))) {
        ruleViolations.push("Multi-blank correct answers must exist in the word bank.");
        break;
      }
    }
  }

  if (ruleViolations.length > 0) {
    throw new Error(`Generated level violated guide rules:\n${ruleViolations.map((x) => `- ${x}`).join("\n")}`);
  }

  return level;
}

export function enforceWordLimit(text: string, maxWords: number): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ");
  if (parts.length <= maxWords) return trimmed;
  return parts.slice(0, maxWords).join(" ");
}
