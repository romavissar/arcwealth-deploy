import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.6 Money Scripts & Beliefs, aligned with textbook sections. */
const EXERCISES_1_1_6: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What are money scripts?",
    options: [
      "Written budgets and financial plans",
      "Unconscious beliefs about money formed primarily in childhood that influence financial behaviour automatically",
      "Rules set by banks",
      "Investment strategies",
    ],
    correct_index: 1,
    explanation:
      "Money scripts are unconscious beliefs about money, formed primarily in childhood through family, culture, and early experiences. They operate automatically.",
  },
  {
    kind: "true_false",
    statement: "The four money script categories identified by Klontz & Britt are: Money Avoidance, Money Worship, Money Vigilance, and Money Status.",
    correct: true,
    explanation: "These four scripts are positioned along emotional relationship (stress vs. security) and behavioural tendency (restrictive vs. expressive).",
  },
  {
    kind: "multiple_choice",
    question: "According to the lesson, where do most money beliefs come from?",
    options: [
      "Media and advertising only",
      "Family and early childhood experiences account for roughly 65% of influence (family 42%, childhood 23%)",
      "Peers only",
      "Financial education in school",
    ],
    correct_index: 1,
    explanation: "Parents/family (42%) and childhood experiences (23%) are the primary sources. Not what parents said — what they did and the emotional atmosphere.",
  },
  {
    kind: "multiple_choice",
    question: "Which money script is associated with the highest savings rate and lowest credit card debt, but also with chronic anxiety and difficulty enjoying wealth?",
    options: ["Money Avoidance", "Money Worship", "Money Vigilance", "Money Status"],
    correct_index: 2,
    explanation: "Money Vigilance produces high savings and low debt but often comes with anxiety and inability to enjoy money.",
  },
  {
    kind: "true_false",
    statement: "The lesson suggests that the question about a money belief is not whether it's objectively true, but whether it serves you — limiting beliefs can be reframed to open possibility.",
    correct: true,
    explanation: "Beliefs aren't true or false, they're useful or not. Reframing isn't about denying reality but opening possibility.",
  },
  {
    kind: "multiple_choice",
    question: "Which script is most associated with spending to project an image, keeping up with peers, and high consumer debt?",
    options: ["Money Avoidance", "Money Worship", "Money Vigilance", "Money Status"],
    correct_index: 3,
    explanation: "Money Status: net worth = self-worth; spending to impress; high debt and financial stress despite good income.",
  },
  {
    kind: "scenario",
    scenario: "Elena underbid on projects and felt sick when her income crossed €50k. In therapy she uncovered a childhood message: 'rich people are greedy.' She had internalised that earning a lot = being a bad person.",
    question: "Which money script does this illustrate, and what changed when she reframed it?",
    options: [
      "Money Worship — she earned more",
      "Money Avoidance — once identified, she could challenge it, raised rates, and built savings",
      "Money Vigilance — she started spending more",
      "Money Status — she bought luxury items",
    ],
    correct_index: 1,
    explanation: "Money Avoidance (money is bad; I don't deserve wealth). Naming and reframing allowed her to raise rates and build savings without guilt.",
  },
  {
    kind: "multiple_choice",
    question: "What does the lesson say about changing money scripts?",
    options: [
      "They change instantly once you read about them",
      "Change is gradual — like rehabilitation; repeated practice over months, with setbacks",
      "Willpower alone is enough",
      "You cannot change them after age 25",
    ],
    correct_index: 1,
    explanation: "Money scripts were built over 10–20+ years. Changing them requires deliberate intervention, repeated practice, and patience — not just willpower.",
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

export function buildLessonSteps1_1_6(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 6 && EXERCISES_1_1_6[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_6[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_6[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_6[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_6.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_6[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
