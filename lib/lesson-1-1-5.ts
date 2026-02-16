import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.5 Delayed Gratification, aligned with textbook sections. */
const EXERCISES_1_1_5: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is delayed gratification?",
    options: [
      "Spending money only on essentials",
      "The ability to resist an immediate reward in favour of a larger or more valuable reward later",
      "Saving for exactly one year",
      "Never buying anything fun",
    ],
    correct_index: 1,
    explanation:
      "Delayed gratification is the ability to resist an immediate reward in favour of a larger or more valuable reward later — self-control applied to time.",
  },
  {
    kind: "true_false",
    statement: "In the marshmallow test follow-up, children who could wait for the second marshmallow had better outcomes decades later — including higher income, higher savings rates, and better credit scores.",
    correct: true,
    explanation: "Mischel's longitudinal research showed that high delayers had higher university completion, income, credit scores, savings rates, and life satisfaction.",
  },
  {
    kind: "multiple_choice",
    question: "What is present bias (hyperbolic discounting)?",
    options: [
      "Preferring to save for the future",
      "The tendency to give disproportionately more weight to rewards available immediately than to rewards available later",
      "A type of investment strategy",
      "Bias against spending money",
    ],
    correct_index: 1,
    explanation: "Present bias means the brain treats 'now' as far more important than 'later' — €100 in a year feels worth much less than €100 today.",
  },
  {
    kind: "multiple_choice",
    question: "According to the lesson, a €200/month difference in saving (€100/mo vs €300/mo) over 40 years at 6% growth leads to a difference of roughly:",
    options: ["€50,000", "€100,000", "€372,000", "€1,000,000"],
    correct_index: 2,
    explanation: "Person A ends with about €186,000, Person B with about €558,000 — a difference of over €372,000 from a €200/month choice.",
  },
  {
    kind: "true_false",
    statement: "The most effective strategies for building delayed gratification are structural — like automating savings — rather than relying on willpower alone.",
    correct: true,
    explanation: "Strategies that remove the decision and make delayed gratification the default vastly outperform repeated willpower. Automation ranks highest.",
  },
  {
    kind: "multiple_choice",
    question: "When pension plans use automatic enrollment (opt-out) instead of opt-in, what typically happens to participation?",
    options: [
      "It stays the same",
      "It drops slightly",
      "It jumps to around 85–95% (from ~40–50%)",
      "It becomes mandatory",
    ],
    correct_index: 2,
    explanation: "Making the long-term choice the default nearly doubles participation. Same benefit, same choice — different default, dramatically different outcome.",
  },
  {
    kind: "scenario",
    scenario: "Matteo and a colleague both earn €2,400/month. Matteo upgraded his lifestyle immediately; his colleague delayed most upgrades. After two years, the colleague has €8,000 saved and no debt; Matteo has no savings and €6,000 in debt.",
    question: "What does this illustrate?",
    options: [
      "Matteo had lower income",
      "Delayed gratification: the colleague sacrificed little in the moment but gained €8,000 and no debt stress",
      "The colleague had a second job",
      "Matteo had higher rent",
    ],
    correct_index: 1,
    explanation: "The difference wasn't income — it was delayed gratification. The long-term gain from delay was enormous; the short-term sacrifice was barely noticeable.",
  },
  {
    kind: "multiple_choice",
    question: "Why does the lesson say delayed gratification is hard?",
    options: [
      "Only because people are lazy",
      "Evolution, dopamine wiring, environmental design (e.g. one-click buying), and social pressure all work against it",
      "Because saving is boring",
      "Because banks don't pay interest",
    ],
    correct_index: 1,
    explanation: "The brain evolved to prioritise 'now'; dopamine favours immediate rewards; friction has been removed from buying; and visible consumption creates social pressure.",
  },
];

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
  }
  if (currentTitle || currentBody.length) {
    sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }
  return sections;
}

export function buildLessonSteps1_1_5(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 6 && EXERCISES_1_1_5[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_5[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_5[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_5[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_5.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_5[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
