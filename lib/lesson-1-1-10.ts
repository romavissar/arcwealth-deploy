import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.10 Values and Money, aligned with textbook sections. */
const EXERCISES_1_1_10: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "In a financial context, what are values?",
    options: [
      "Moral rules about what you should want",
      "The principles, qualities, and experiences that matter most to you — what makes life feel meaningful and worthwhile; the north star that should guide where your money goes",
      "Whatever advertising tells you to buy",
      "Only family and health",
    ],
    correct_index: 1,
    explanation:
      "Values are what you genuinely care about — not morals or social pressure. When spending aligns with your values, it brings lasting satisfaction; when it conflicts, it brings regret.",
  },
  {
    kind: "true_false",
    statement: "Values-aligned purchases tend to maintain satisfaction over time; misaligned purchases often lose appeal within days or weeks.",
    correct: true,
    explanation: "Consumer psychology research shows that aligned spending has high repeat-purchase rates and lasting satisfaction; misaligned spending creates quick regret.",
  },
  {
    kind: "multiple_choice",
    question: "According to the lesson, how many core values should you identify as your financial compass?",
    options: ["All 12", "Exactly 3", "Your top 3–5", "Only 1"],
    correct_index: 2,
    explanation: "Most people find their top 3–5 values drive 80%+ of their happiest financial decisions. Rate all 12, then force-rank your top 5.",
  },
  {
    kind: "multiple_choice",
    question: "In the Value-Money Alignment Matrix, which quadrant should you eliminate or drastically reduce?",
    options: [
      "Best (low cost + aligned)",
      "Intentional (high cost + aligned)",
      "Worst (high cost + misaligned)",
      "Neutral (low cost + misaligned)",
    ],
    correct_index: 2,
    explanation: "Worst quadrant = expensive + misaligned. These are the biggest regret generators. Goal: maximise Best and Intentional, minimise Worst and Neutral.",
  },
  {
    kind: "true_false",
    statement: "Values-based spending (vs typical) nearly triples the share of income going to aligned priorities — e.g. 52% vs 18% — without earning more.",
    correct: true,
    explanation: "By cutting misaligned spending and redirecting it to aligned priorities, you can dramatically increase satisfaction per euro. Same income, different allocation.",
  },
  {
    kind: "scenario",
    scenario: "Clara was spending €200/month at coffee shops (solo, rushed). Her top values were community and growth. She cut coffee to 2x/week and redirected €150/month to coworking (community) and online courses (growth). Six months later she said coworking and courses were among her best decisions; the daily coffee she barely remembered.",
    question: "What does this illustrate?",
    options: [
      "Coffee is always a waste",
      "High-frequency, low-consciousness spending is often misaligned; same money reallocated to values creates much higher satisfaction",
      "Coworking is better than coffee",
      "€200/month is too much for anyone",
    ],
    correct_index: 1,
    explanation: "The lesson: audit autopilot habits. Same money, aligned to values, produces completely different satisfaction.",
  },
  {
    kind: "multiple_choice",
    question: "Marcus had two job offers: A €52k/50 hrs, B €45k/35 hrs flexible. His top values were family, health, and freedom. He took B. What does the lesson say this illustrates?",
    options: [
      "Lower salary is always better",
      "The highest-paying option is only best if income maximisation is your top value; money is a tool to serve your values",
      "Remote work is always better",
      "Family is more important than money",
    ],
    correct_index: 1,
    explanation: "Money is a tool to serve your values. Sometimes more money serves them; sometimes it doesn't. Company A would have paid more but damaged what he actually valued.",
  },
  {
    kind: "multiple_choice",
    question: "What is the suggested 30-day values alignment plan (weeks 1–4)?",
    options: [
      "Spend nothing for 30 days",
      "Week 1: rank top 5 values; Week 2: categorise last month's spending by alignment; Week 3: identify 3 misaligned to cut + 3 aligned to increase; Week 4: implement and track satisfaction",
      "Only track spending",
      "Cut all non-essential spending",
    ],
    correct_index: 1,
    explanation: "Identify values → audit spending → plan specific cuts and increases → implement and track. Most people report reduced guilt, easier 'no,' and more satisfaction per euro.",
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

export function buildLessonSteps1_1_10(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 8 && EXERCISES_1_1_10[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_10[exerciseIndex] });
      exerciseIndex++;
      if (num <= 3 && EXERCISES_1_1_10[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_10[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_10.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_10[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
