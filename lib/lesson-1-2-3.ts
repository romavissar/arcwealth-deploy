import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.2.3 Net vs. Gross Income, aligned with textbook sections. */
const EXERCISES_1_2_3: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is the difference between gross and net income?",
    options: [
      "Gross is monthly, net is annual",
      "Gross is total earned before deductions; net (take-home) is what actually arrives after taxes, insurance, pension, etc.",
      "They are the same",
      "Net is always higher than gross",
    ],
    correct_index: 1,
    explanation: "Job offers and contracts quote gross. Your budget must be based on net — what hits your bank account.",
  },
  {
    kind: "true_false",
    statement: "Budgeting based on gross income instead of net can create a large monthly shortfall — e.g. planning on €2,917/month when you only receive €2,136 means you are short €781 every month.",
    correct: true,
    explanation: "Always budget on net. Use net annual ÷ 12 or your actual net paycheck amount.",
  },
  {
    kind: "multiple_choice",
    question: "What is progressive taxation?",
    options: [
      "Everyone pays the same percentage",
      "Higher earners pay a higher percentage of their income in tax — so take-home percentage falls as gross rises",
      "Tax rates never change",
      "Only the rich pay tax",
    ],
    correct_index: 1,
    explanation: "Low earners might keep 80–85%; high earners 55–65%. Doubling gross does not double net.",
  },
  {
    kind: "multiple_choice",
    question: "Which of these is typically a deduction that reduces gross to net?",
    options: [
      "Employer pension contribution",
      "Income tax, social insurance, USC/levies, and employee pension contribution",
      "Your rent",
      "Savings",
    ],
    correct_index: 1,
    explanation: "The four major deduction categories are income tax, social insurance, USC/levies, and pension (employee share).",
  },
  {
    kind: "multiple_choice",
    question: "When comparing two job offers (e.g. Dublin vs Berlin), what should you do?",
    options: [
      "Choose the one with the higher gross salary",
      "Calculate net income for each and adjust for cost of living — gross alone is misleading",
      "Only compare benefits",
      "Always choose the same city",
    ],
    correct_index: 1,
    explanation: "Liam's example: lower gross in Porto left him better off after tax and rent than higher gross in Dublin.",
  },
  {
    kind: "scenario",
    scenario: "Kayla accepted a job at €28,000, budgeted on €2,333/month, and rented a €900 apartment. Her first paycheck was €1,820. She was short €513 every month and had to borrow and eventually move back home.",
    question: "What caused this?",
    options: [
      "The job paid too little",
      "She budgeted on gross instead of net — one calculation error led to the crisis",
      "Rent was too high",
      "She had no savings",
    ],
    correct_index: 1,
    explanation: "Always use a salary calculator and budget on net before signing a lease or making commitments.",
  },
  {
    kind: "true_false",
    statement: "Opting out of an employer pension that includes matching is usually a good way to increase take-home pay without losing anything.",
    correct: false,
    explanation: "Employer matching is free money. Sophie's opt-out cost her the match plus decades of compound growth.",
  },
  {
    kind: "multiple_choice",
    question: "How can you estimate your net income before your first paycheck?",
    options: [
      "Guess randomly",
      "Use an online salary/take-home calculator for your country, or rough percentage benchmarks (e.g. 73–78% for €25k–40k gross)",
      "Use last year's payslip only",
      "Net is always 50% of gross",
    ],
    correct_index: 1,
    explanation: "Search '[your country] salary calculator'. Always verify with a proper calculator or your actual payslip.",
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

export function buildLessonSteps1_2_3(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 8 && EXERCISES_1_2_3[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_2_3[exerciseIndex] });
      exerciseIndex++;
      if (num <= 4 && EXERCISES_1_2_3[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_2_3[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_2_3.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_2_3[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
