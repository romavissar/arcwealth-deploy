import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.11 Financial Goals That Stick, aligned with textbook sections. */
const EXERCISES_1_1_11: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "According to the lesson, why do most financial goals fail?",
    options: [
      "Lack of willpower or laziness",
      "They are set up to fail from the start — vague, no deadline, no tracking",
      "People don't earn enough",
      "Goals are too easy",
    ],
    correct_index: 1,
    explanation: "The problem isn't willpower. Most goals are wishes: no specific target, timeline, measurement, or reason. Vague goals produce vague results.",
  },
  {
    kind: "true_false",
    statement: "Achievement rates for fully SMART goals are about 76%, versus about 12% for vague goals — over 6× higher.",
    correct: true,
    explanation: "Goal-setting research shows that structure dramatically improves success. SMART = Specific, Measurable, Achievable, Relevant, Time-bound.",
  },
  {
    kind: "multiple_choice",
    question: "What does the 'T' in SMART stand for?",
    options: ["Tough", "Tracked", "Time-bound", "Target"],
    correct_index: 2,
    explanation: "Time-bound means a clear deadline. Without it, goals drift into 'someday' — which never comes.",
  },
  {
    kind: "multiple_choice",
    question: "Which of these is cited as one of the most common reasons financial goals fail?",
    options: [
      "Earning too much money",
      "No tracking system — can't see progress, lose motivation",
      "Goals that are too easy",
      "Having too many goals",
    ],
    correct_index: 1,
    explanation: "No tracking (51% of failures) is a top reason. Solution: weekly tracking so progress is visible.",
  },
  {
    kind: "true_false",
    statement: "Vague goals and SMART goals have similar achievement rates in research.",
    correct: false,
    explanation: "SMART goals achieve roughly 6× higher completion rates than vague goals in studies. Specific, measurable, time-bound goals work.",
  },
  {
    kind: "multiple_choice",
    question: "Why do milestones help with large goals?",
    options: [
      "They make the goal smaller so you can quit earlier",
      "They create frequent finish lines (30–60 days), eliminate the 'middle slog,' and sustain motivation with small wins",
      "They are required by banks",
      "They only help with debt",
    ],
    correct_index: 1,
    explanation: "Motivation dips in the middle of big goals. Milestones create artificial finish lines and early warning if you're off track.",
  },
  {
    kind: "scenario",
    scenario: "Sofia's first goal was 'Build an emergency fund' — no amount, deadline, or tracking. She saved €120 in 6 months then spent it. Her second goal was 'Save €1,500 emergency fund by June 30, 2025' with milestones, a physical tracker, and weekly check-ins with her sister. She hit €1,500 by June 28.",
    question: "What does this illustrate?",
    options: [
      "Sofia became more disciplined",
      "The goal setup — SMART, milestones, tracking, accountability — made the difference, not the person",
      "Sisters are the best accountability partners",
      "€1,500 is an easy target",
    ],
    correct_index: 1,
    explanation: "Same person. What changed was the goal structure: specific target, deadline, milestones, visible tracking, accountability.",
  },
  {
    kind: "multiple_choice",
    question: "What is the final step in the 6-step goal-setting process?",
    options: [
      "Set a new goal",
      "Review and adjust — monthly check whether to continue, adjust timeline/target, or adapt",
      "Celebrate and stop",
      "Build more accountability",
    ],
    correct_index: 1,
    explanation: "Goals should adapt to changing circumstances, not become prisons. Monthly review makes adjustment possible.",
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

export function buildLessonSteps1_1_11(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 10 && EXERCISES_1_1_11[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_11[exerciseIndex] });
      exerciseIndex++;
      if (num <= 3 && EXERCISES_1_1_11[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_11[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_11.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_11[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
