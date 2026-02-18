import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.2.4 How to Read a Payslip, aligned with textbook sections. */
const EXERCISES_1_2_4: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is a payslip?",
    options: [
      "A tax form",
      "A document each pay period showing gross pay, all deductions, net pay, and year-to-date totals — a receipt and record of earnings and tax",
      "A bank statement",
      "An employment contract",
    ],
    correct_index: 1,
    explanation: "It serves verification (paid correctly), record (for loans, tax returns), and tax evidence.",
  },
  {
    kind: "true_false",
    statement: "Studies suggest 15–30% of employees experience at least one payroll error per year.",
    correct: true,
    explanation: "Checking your payslip every month is one of the highest-return financial habits.",
  },
  {
    kind: "multiple_choice",
    question: "What are the six key sections of a typical payslip?",
    options: [
      "Only gross and net",
      "Personal info, pay period, earnings (gross), deductions, net pay, year-to-date totals",
      "Name, salary, bank details",
      "Tax code only",
    ],
    correct_index: 1,
    explanation: "Check all six every month — errors in any section can cost you money.",
  },
  {
    kind: "multiple_choice",
    question: "Why does an incorrect tax code (e.g. 0T emergency code) cost you money?",
    options: [
      "It doesn't — tax is the same either way",
      "It causes over-deduction of tax (e.g. €200–500/month extra); you must claim a refund later",
      "It only affects pension",
      "It only matters at year-end",
    ],
    correct_index: 1,
    explanation: "Wrong code = maximum tax deducted. Get the correct code to payroll within the first month.",
  },
  {
    kind: "multiple_choice",
    question: "Which is the most commonly experienced payslip error according to the lesson?",
    options: [
      "Wrong bank details",
      "Incorrect tax code — 24% of employees experience this at some point",
      "Missing pension",
      "Wrong name",
    ],
    correct_index: 1,
    explanation: "Followed by missing overtime (18%), hours mismatch (15%), wrong rate (12%), etc.",
  },
  {
    kind: "scenario",
    scenario: "Marcus's payslip showed tax code 0T for six months. He was overpaying €426/month in tax. He only found out when a colleague mentioned checking tax codes. He had to claim the overpayment from the tax office — it took 4 months.",
    question: "What does this illustrate?",
    options: [
      "Tax codes don't matter",
      "Check your tax code on your very first payslip; emergency codes are temporary — get it corrected within a month",
      "Colleagues always know better",
      "Refunds are instant",
    ],
    correct_index: 1,
    explanation: "Always check your first payslip. If code is wrong, contact payroll with your tax code notice immediately.",
  },
  {
    kind: "multiple_choice",
    question: "What should you do when you find an error on your payslip?",
    options: [
      "Ignore it — it will fix itself",
      "Document it, check your contract, email payroll within 48h with what's wrong and what it should be, follow up if no response in 3 days",
      "Only tell HR at year-end",
      "Change jobs",
    ],
    correct_index: 1,
    explanation: "Payroll errors have time limits for correction (often 3–6 months). Report immediately.",
  },
  {
    kind: "true_false",
    statement: "The lesson says checking your payslip thoroughly takes at least 30 minutes, so you should only do it once a year.",
    correct: false,
    explanation: "The 7-step check takes about 5 minutes. Do it every month and save payslips for at least 6 years.",
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

export function buildLessonSteps1_2_4(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 7 && EXERCISES_1_2_4[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_2_4[exerciseIndex] });
      exerciseIndex++;
      if (num <= 4 && EXERCISES_1_2_4[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_2_4[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_2_4.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_2_4[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
