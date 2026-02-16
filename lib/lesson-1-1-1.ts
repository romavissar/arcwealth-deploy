import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.1 What Is Money?, aligned with textbook sections. */
const EXERCISES_1_1_1: LessonExercise[] = [
  // After 01 — Defining Money
  {
    kind: "multiple_choice",
    question: "According to the lesson, what gives money its value?",
    options: [
      "The material it's made of (e.g. paper or metal)",
      "Collective trust and shared agreement in society",
      "Government printing",
      "The central bank",
    ],
    correct_index: 1,
    explanation:
      "Money gets its power from trust and shared belief — not from the material it's made of. A $10 note is worth $10 because millions of people agree it is.",
  },
  {
    kind: "true_false",
    statement: "Money is defined as any widely accepted medium of exchange that people use to trade goods and services, store value, and measure worth.",
    correct: true,
    explanation: "That's the core definition. Money doesn't have to be paper or coins — it's whatever a society agrees to use.",
  },
  // After 02 — Three Functions
  {
    kind: "multiple_choice",
    question: "Which of these is NOT one of the three core functions of money?",
    options: [
      "Medium of exchange",
      "Store of value",
      "Unit of account",
      "Unit of production",
    ],
    correct_index: 3,
    explanation: "The three functions are medium of exchange, store of value, and unit of account. 'Unit of production' is not one of them.",
  },
  {
    kind: "multiple_choice",
    question: "When money fails as a store of value (e.g. during extreme inflation), what often happens?",
    options: [
      "People save more of it",
      "People stop trusting it as a medium of exchange too",
      "Governments print less",
      "Banks charge lower fees",
    ],
    correct_index: 1,
    explanation: "The three functions are interdependent. Zimbabwe in 2008 is an example — when the currency lost value, people abandoned it entirely.",
  },
  // After 03 — What Makes Good Money
  {
    kind: "multiple_choice",
    question: "Which property of money means 'can be split into smaller units without losing value'?",
    options: ["Durability", "Portability", "Divisibility", "Uniformity"],
    correct_index: 2,
    explanation: "Divisibility means you can split it — e.g. $1 = 100 cents. Durability is about not rotting; portability is about carrying it; uniformity is about each unit being identical.",
  },
  {
    kind: "true_false",
    statement: "Limited supply is an important property of money — if something can be created infinitely, it tends to become worthless.",
    correct: true,
    explanation: "Gold must be mined; governments control printing. Without limited supply, money would lose its value.",
  },
  // After 04 — How Money Evolved
  {
    kind: "multiple_choice",
    question: "What is the 'double coincidence of wants' problem in barter?",
    options: [
      "You need two coins to buy one thing",
      "You must find someone who has what you want AND wants what you have",
      "Money has to be stored in two places",
      "Barter only works twice a year",
    ],
    correct_index: 1,
    explanation: "In barter, you need to find someone who wants your wheat and has the shoes you want — at the same time. That's why barter failed as societies grew.",
  },
  // After 05 — Forms of Money Today
  {
    kind: "multiple_choice",
    question: "Roughly what share of money in a typical developed economy is digital (numbers in computers) rather than physical cash?",
    options: ["About 10%", "About 50%", "About 75%", "About 90–95%"],
    correct_index: 3,
    explanation: "Most money today is digital — bank deposits, cards, apps. When you tap your card, no physical coins move; banks update numbers.",
  },
  {
    kind: "true_false",
    statement: "Fiat currency (like EUR or USD) is backed by a physical commodity such as gold.",
    correct: false,
    explanation: "Fiat currency is government-issued money with no physical commodity backing — its value comes from government trust and law.",
  },
  // After 06 — Real-World Examples / Summary
  {
    kind: "multiple_choice",
    question: "The Rai stones of Yap Island illustrate that money is fundamentally:",
    options: [
      "Heavy and physical",
      "A shared ledger of trust — ownership can be agreed without moving the object",
      "Only valid if made of metal",
      "Controlled by the government",
    ],
    correct_index: 1,
    explanation: "Some stones were too heavy to move; the community simply agreed on a change of ownership. Money is a social agreement, not just a physical object.",
  },
  {
    kind: "scenario",
    scenario: "Zimbabwe experienced hyperinflation in 2008. The government had printed so much money that a loaf of bread cost billions of Zimbabwean dollars.",
    question: "What property of money broke down in this situation?",
    options: [
      "Portability",
      "Divisibility",
      "Limited supply — too much money was created",
      "Uniformity",
    ],
    correct_index: 2,
    explanation: "When the supply of money is not limited and the government prints excessively, money fails as a store of value and the system can collapse.",
  },
];

/**
 * Splits markdown into sections by ## headers. Returns array of { title, body }.
 * Strips the first line if it's the main title (# Topic ...).
 */
function splitMarkdownIntoSections(markdown: string): { title: string; body: string }[] {
  const lines = markdown.split("\n");
  const sections: { title: string; body: string }[] = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (currentTitle || currentBody.length) {
        sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
      }
      currentTitle = match[1].trim();
      currentBody = [];
    } else if (currentTitle || currentBody.length) {
      currentBody.push(line);
    }
    // Skip lines before first ## (e.g. # Topic 1.1.1, **Reading Time**, ---)
  }
  if (currentTitle || currentBody.length) {
    sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }
  return sections;
}

/**
 * Build lesson steps for 1.1.1 from the textbook markdown.
 * Alternates content sections with exercises so the lesson is long and aligned with the textbook.
 */
export function buildLessonSteps1_1_1(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    // Skip only if section has almost no content (e.g. "Next Lesson" line)
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    // After sections 01–05, add exercises so the lesson checks understanding as you go
    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 5 && EXERCISES_1_1_1[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_1[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_1[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_1[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  // Add remaining exercises after the last content (e.g. after Lesson Summary)
  while (exerciseIndex < EXERCISES_1_1_1.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_1[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
