import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.2.2 Salary, Wages, and Paychecks, aligned with textbook sections. */
const EXERCISES_1_2_2: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is the fundamental difference between salary and wage?",
    options: [
      "Salary is monthly, wage is weekly",
      "Salary is a fixed annual amount regardless of hours; wage is payment per unit of time worked (e.g. per hour), so total pay varies with hours",
      "Wage is always higher than salary",
      "Only salary includes benefits",
    ],
    correct_index: 1,
    explanation: "Salary = fixed amount per year, same each period. Wage = rate × hours; total varies with hours worked.",
  },
  {
    kind: "true_false",
    statement: "In most countries and contracts, salaried employees are not entitled to overtime pay — working 50 hours in a week still yields the same salary as 40 hours.",
    correct: true,
    explanation: "Some jurisdictions require overtime for salaried staff below certain income thresholds; always check your contract and local law.",
  },
  {
    kind: "multiple_choice",
    question: "What are typical overtime multipliers for waged employees?",
    options: [
      "Only 1×",
      "1.5× (time-and-a-half) for standard overtime, 2× or 2.5×+ for weekends or holidays — varies by contract and country",
      "Always 2×",
      "Overtime does not exist for wages",
    ],
    correct_index: 1,
    explanation: "Common: 1.5× for hours beyond standard; 2× for double time; 2.5×+ for public holidays.",
  },
  {
    kind: "multiple_choice",
    question: "If you are paid bi-weekly (26 payments per year), what is the 'bonus month' effect?",
    options: [
      "You get a 13th month salary",
      "Twice a year you receive three paychecks in one month — many people use the third for savings or debt payoff",
      "You are paid weekly",
      "There is no such effect",
    ],
    correct_index: 1,
    explanation: "Budget around two paychecks per month; the two months with three paychecks are strategic savings opportunities.",
  },
  {
    kind: "true_false",
    statement: "A waged employee at €15/hour who takes 4 weeks unpaid holiday earns the same annual amount as a salaried employee at €31,200/year with 4 weeks paid holiday.",
    correct: false,
    explanation: "True hourly comparison must include paid time off. Salary with paid leave can be worth more in total than the same hourly rate with unpaid leave.",
  },
  {
    kind: "scenario",
    scenario: "Marco worked 50-hour weeks at 1.5× overtime for 8 weeks, then hours dropped to 35/week. He had budgeted at the higher rate and then struggled when income fell.",
    question: "What does the lesson recommend?",
    options: [
      "Never work overtime",
      "Budget based on standard hours; treat overtime as bonus income for savings or one-time expenses, not regular spending",
      "Always work maximum overtime",
      "Quit when hours drop",
    ],
    correct_index: 1,
    explanation: "Overtime income is temporary. Base your budget on standard hours to avoid a crunch when hours drop.",
  },
  {
    kind: "multiple_choice",
    question: "When comparing a salaried offer (e.g. €30,000 with 4 weeks paid holiday and employer pension) to a waged offer (e.g. €16/hour), what should you do?",
    options: [
      "Always take the higher headline number",
      "Compare total compensation — include paid time off and benefits; the salary may be worth more in true value",
      "Salary is always better",
      "Wage is always better for flexibility",
    ],
    correct_index: 1,
    explanation: "Anya's example: wage job had higher headline pay but salary job with benefits and paid leave had greater true value.",
  },
  {
    kind: "multiple_choice",
    question: "What does the lesson say about aligning your budget with pay frequency?",
    options: [
      "Always use monthly budget",
      "Budget period should match pay frequency — e.g. if paid bi-weekly, budget in two-week chunks",
      "Pay frequency does not matter",
      "Weekly is always best",
    ],
    correct_index: 1,
    explanation: "Forcing a monthly budget onto bi-weekly pay creates unnecessary complexity. Match the budget period to when you get paid.",
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

export function buildLessonSteps1_2_2(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 8 && EXERCISES_1_2_2[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_2_2[exerciseIndex] });
      exerciseIndex++;
      if (num <= 4 && EXERCISES_1_2_2[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_2_2[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_2_2.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_2_2[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
