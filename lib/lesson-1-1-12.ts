import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.12 Habits That Build Wealth, aligned with textbook sections. */
const EXERCISES_1_1_12: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "According to the lesson, what matters more for long-term financial outcomes?",
    options: [
      "Goals alone",
      "Habits — they're automatic, compound over time, and survive when motivation fades",
      "Willpower",
      "Luck",
    ],
    correct_index: 1,
    explanation: "Goals tell you where you're going; habits determine whether you get there. Habits are the vehicle.",
  },
  {
    kind: "true_false",
    statement: "The habit loop has four stages: Cue (trigger) → Craving (desire) → Routine (behaviour) → Reward (satisfaction). To build a good habit, make the cue obvious, craving attractive, routine easy, and reward satisfying.",
    correct: true,
    explanation: "Understanding the loop is the key to both building good habits and breaking bad ones.",
  },
  {
    kind: "multiple_choice",
    question: "Which habit is ranked #1 by long-term impact in the lesson?",
    options: [
      "Track spending weekly",
      "Automate savings — automatic transfers the day after payday",
      "Invest consistently",
      "Review finances monthly",
    ],
    correct_index: 1,
    explanation: "Automate savings (95% impact) removes willpower from the equation and forces 'pay yourself first.'",
  },
  {
    kind: "multiple_choice",
    question: "When does 'The Dip' occur in habit formation, and why is it dangerous?",
    options: [
      "Week 1 — you're too excited",
      "Week 3 (days 14–28) — effort is highest, most people quit here",
      "Week 10 — habit is already automatic",
      "Day 1 — initial resistance",
    ],
    correct_index: 1,
    explanation: "Week 3 is when motivation vanishes and effort feels highest. Pushing through to Week 6 makes success much more likely.",
  },
  {
    kind: "true_false",
    statement: "Habit stacking means replacing an existing habit entirely with a new one.",
    correct: false,
    explanation: "Existing habits are reliable cues. No new cue needed — the old habit reminds you.",
  },
  {
    kind: "multiple_choice",
    question: "What is the two-minute rule?",
    options: [
      "Spend only two minutes on finances per day",
      "Make the habit so small it takes less than two minutes — focus on showing up, then scale later",
      "Review goals every two minutes",
      "Take a two-minute break between habits",
    ],
    correct_index: 1,
    explanation: "You build the habit of showing up first. 'Transfer €1' is easier than 'save €200' and builds identity.",
  },
  {
    kind: "scenario",
    scenario: "Marcus spent €4.50 on coffee every workday (€1,170/year). He habit-stacked: 'After I arrive at work, I will make instant coffee in the kitchen.' The cue and craving stayed the same; only the routine changed. Within 3 weeks it stuck. He invested the €1,170/year; at 7% over 10 years that's over €16,000.",
    question: "What does this illustrate?",
    options: [
      "Coffee is bad",
      "Don't eliminate cravings — redirect them to cheaper routines; habit stacking can swap the routine while keeping the same cue",
      "Instant coffee is better",
      "You need 10 years to see results",
    ],
    correct_index: 1,
    explanation: "Same cue (arriving at work), same craving (caffeine, ritual). Only the routine changed — and compounded.",
  },
  {
    kind: "multiple_choice",
    question: "What does the lesson say about building multiple habits at once vs one at a time?",
    options: [
      "Building many at once is better",
      "One habit at a time has ~75% success rate; multiple at once ~35% — stack habits sequentially",
      "It doesn't matter",
      "Only ever build one habit total",
    ],
    correct_index: 1,
    explanation: "Research shows sequential stacking works better. Build the first 3 until automatic (3–4 months), then add the next.",
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

export function buildLessonSteps1_1_12(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 9 && EXERCISES_1_1_12[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_12[exerciseIndex] });
      exerciseIndex++;
      if (num <= 3 && EXERCISES_1_1_12[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_12[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_12.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_12[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
