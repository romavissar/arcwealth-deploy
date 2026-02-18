import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.2.1 What Is Income?, aligned with textbook sections. */
const EXERCISES_1_2_1: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is income?",
    options: [
      "Only salary from a job",
      "Any money received from any source — work, investments, assets — the foundation of personal finance",
      "Wealth you have saved",
      "Money you spend",
    ],
    correct_index: 1,
    explanation: "Income is money flowing toward you. It differs by how it's earned, taxed, and whether it requires your time.",
  },
  {
    kind: "multiple_choice",
    question: "Which type of income is earned directly in exchange for your time and stops when you stop working?",
    options: ["Portfolio income", "Passive income", "Active income", "Investment income"],
    correct_index: 2,
    explanation: "Active income = salary, wages, freelance, commissions. It's limited by the number of hours in a day.",
  },
  {
    kind: "true_false",
    statement: "Wealthy individuals (e.g. top 5%) typically derive most of their income from portfolio and passive sources — more than two-thirds of income can require no labour.",
    correct: true,
    explanation: "As wealth grows, the share from active income falls. The strategy: use active income to build portfolio and passive income over time.",
  },
  {
    kind: "multiple_choice",
    question: "What is the difference between gross and net income?",
    options: [
      "Gross is monthly, net is annual",
      "Gross is total earned before deductions; net (take-home) is what actually arrives after taxes and deductions — always plan budgets from net",
      "They are the same",
      "Net is before tax, gross is after",
    ],
    correct_index: 1,
    explanation: "Job offers quote gross. Your budget should be based on net — what hits your bank account.",
  },
  {
    kind: "multiple_choice",
    question: "Why does relying on a single income source create vulnerability?",
    options: [
      "It doesn't — one job is safest",
      "Job loss, illness, or industry disruption can remove all income at once; multiple streams reduce risk",
      "Single income is always low",
      "Taxes are higher",
    ],
    correct_index: 1,
    explanation: "Building additional streams (e.g. job + investments + side income) over time reduces dependence on any one source.",
  },
  {
    kind: "multiple_choice",
    question: "According to the lesson, what is often the highest-leverage income move for most employed people?",
    options: [
      "Start a business immediately",
      "Ask for a raise or negotiate a job offer — can deliver €2k–5k+ annually quickly",
      "Only invest in stocks",
      "Quit and freelance",
    ],
    correct_index: 1,
    explanation: "A 15-minute salary negotiation can equal months of aggressive budgeting. We cover negotiation in Lesson 1.2.4.",
  },
  {
    kind: "scenario",
    scenario: "Kaito accepted a job at €28,000 gross. He expected ~€2,333/month. His first payslip showed €1,820 — deductions for tax, social insurance, USC, and pension. He had been planning his budget on the wrong figure.",
    question: "What does this illustrate?",
    options: [
      "€28,000 is too low",
      "Always use net (take-home), not gross, when planning your budget — job offers are quoted in gross",
      "Pension contributions are bad",
      "Payslips are always wrong",
    ],
    correct_index: 1,
    explanation: "Build your budget from the money that actually arrives in your account.",
  },
  {
    kind: "true_false",
    statement: "Income and wealth are the same thing — high income always means high wealth.",
    correct: false,
    explanation: "Many high earners spend everything. Modest income, saved and invested consistently, can build significant wealth over time.",
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

export function buildLessonSteps1_2_1(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 7 && EXERCISES_1_2_1[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_2_1[exerciseIndex] });
      exerciseIndex++;
      if (num <= 3 && EXERCISES_1_2_1[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_2_1[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_2_1.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_2_1[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
