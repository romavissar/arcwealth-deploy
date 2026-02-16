import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.2 Needs vs. Wants, aligned with textbook sections. */
const EXERCISES_1_1_2: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "According to the lesson, what is a 'need'?",
    options: [
      "Something that improves comfort or enjoyment",
      "Something essential for basic survival, health, safety, or participation in modern life",
      "Whatever you feel like buying",
      "Anything advertised as essential",
    ],
    correct_index: 1,
    explanation:
      "A need is something essential for basic survival, health, safety, or participation in modern life. Without it, your wellbeing is genuinely at risk.",
  },
  {
    kind: "true_false",
    statement: "The line between needs and wants is often blurry, and context, culture, and marketing can shift our perception of what we 'need'.",
    correct: true,
    explanation: "The boundary is rarely clean. Internet was a want in 1995 and a need in 2025; advertising and social pressure also blur the line.",
  },
  {
    kind: "multiple_choice",
    question: "What is the 'upgrade trap' described in the lesson?",
    options: [
      "Upgrading your job to earn more",
      "Needing the base item but wanting the premium version — e.g. needing a phone but wanting the latest model",
      "Spending more when you get a raise",
      "Trading old items for new ones",
    ],
    correct_index: 1,
    explanation: "The base item (e.g. a functioning phone) is a need; the newest model or premium version is a want. Recognising this can save hundreds of euros per year.",
  },
  {
    kind: "multiple_choice",
    question: "As income rises, what tends to happen to the share of spending on wants?",
    options: [
      "It stays the same",
      "It decreases",
      "It tends to expand — sometimes faster than income",
      "It disappears entirely",
    ],
    correct_index: 2,
    explanation: "Wants tend to grow with income; this is called lifestyle inflation. More income doesn't automatically mean more savings if wants expand to fill the gap.",
  },
  {
    kind: "true_false",
    statement: "Person A (saving €200/month) and Person B (saving €50/month) with the same income can end up with a large gap in wealth after 10 years, mainly because of the needs/wants distinction applied over time.",
    correct: true,
    explanation: "The lesson shows that consistent clarity about needs vs wants, and saving the difference, compounds into roughly four times more wealth for Person A over 10 years.",
  },
  {
    kind: "multiple_choice",
    question: "Which of these is NOT cited as a force that blurs the line between needs and wants?",
    options: [
      "Marketing and advertising",
      "Social comparison (everyone around you has it)",
      "Habit and comfort",
      "Government regulation",
    ],
    correct_index: 3,
    explanation: "Marketing, social comparison, habit, and context all blur the line. Government regulation is not discussed as a cause.",
  },
  {
    kind: "multiple_choice",
    question: "The 3-Question Test includes: 'Would my health, safety, or ability to work/study be at risk without this?' If the answer is no, the item is probably a ___.",
    options: ["Need", "Want", "Grey area", "Luxury"],
    correct_index: 1,
    explanation: "If health, safety, or work/study would not be at risk without it, it's probably a want rather than a need.",
  },
  {
    kind: "scenario",
    scenario: "Amara is a university student with €900/month. She finds she's overdrawn and realises €340 goes to restaurants, delivery, clothes, and streaming — which she had thought of as 'just living'.",
    question: "What is the key shift that helps her?",
    options: [
      "Stopping all spending on wants",
      "Separating needs from wants and then consciously deciding how to allocate the rest, rather than drifting into spending",
      "Getting a second job",
      "Moving back home",
    ],
    correct_index: 1,
    explanation: "She didn't stop spending on wants; she separated them from her needs budget and then decided how to allocate the remainder consciously.",
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
  }
  if (currentTitle || currentBody.length) {
    sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }
  return sections;
}

/**
 * Build lesson steps for 1.1.2 from the textbook markdown.
 * Alternates content sections with exercises.
 */
export function buildLessonSteps1_1_2(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 5 && EXERCISES_1_1_2[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_2[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_2[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_2[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_2.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_2[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
