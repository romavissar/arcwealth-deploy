import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.4 Dopamine, Rewards, and Spending, aligned with textbook sections. */
const EXERCISES_1_1_4: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "According to the lesson, when does dopamine typically peak in the purchase journey?",
    options: [
      "When the item is delivered",
      "When you first see the product",
      "At checkout — the moment of deciding to buy",
      "A week after you receive the item",
    ],
    correct_index: 2,
    explanation:
      "Dopamine peaks at the checkout stage — the moment of deciding to buy. By the time the item arrives, the response is already declining.",
  },
  {
    kind: "true_false",
    statement: "Dopamine drives motivation and reward-seeking; it is released in anticipation of a potential reward, not just when the reward is received.",
    correct: true,
    explanation: "Dopamine motivates you to pursue things; it peaks before receipt. Satisfaction is governed by other brain systems.",
  },
  {
    kind: "multiple_choice",
    question: "Which type of reward schedule is more habit-forming and addictive?",
    options: [
      "Fixed — you always know when the reward comes",
      "Variable — the reward comes at unpredictable intervals",
      "Neither; they are equally addictive",
      "Only rewards over €100",
    ],
    correct_index: 1,
    explanation: "Variable reward schedules produce the most persistent, compulsive behaviour. The brain keeps engaging because 'this next attempt might be the one.'",
  },
  {
    kind: "multiple_choice",
    question: "What is hedonic adaptation?",
    options: [
      "The tendency to buy more when you are happy",
      "The psychological tendency to return to a stable level of happiness despite positive or negative changes — you get used to what you buy",
      "A type of reward schedule used in games",
      "The urge to shop when stressed",
    ],
    correct_index: 1,
    explanation: "Hedonic adaptation means that no matter what you buy, you eventually get used to it and it stops producing happiness. No purchase can sustainably raise baseline happiness.",
  },
  {
    kind: "true_false",
    statement: "Research shows that material purchases typically retain satisfaction longer than experiences like travel or meals with friends.",
    correct: false,
    explanation: "Experiences retain satisfaction significantly longer than material goods — memory maintains emotional warmth and they become part of your story.",
  },
  {
    kind: "multiple_choice",
    question: "Which of these is a counter-strategy suggested for the 'anticipation is the peak' mechanism?",
    options: [
      "Spend more on delivery to get items faster",
      "Use wishlists to channel anticipation without purchasing",
      "Only shop when stressed",
      "Avoid all online shopping",
    ],
    correct_index: 1,
    explanation: "Use wishlists to channel anticipation without purchasing. This addresses the fact that marketers make browsing and add-to-cart frictionless.",
  },
  {
    kind: "scenario",
    scenario: "Sofia went from a basic skincare routine (€25) to 34 products (€400+) after a year of TikTok skincare content. She doesn't feel her skin is 32 products better.",
    question: "What does this illustrate?",
    options: [
      "Skincare is a scam",
      "Hedonic adaptation plus variable reward: each new product gave a brief dopamine hit then became background; the feed kept resetting the cycle",
      "She should delete TikTok",
      "Expensive products don't work",
    ],
    correct_index: 1,
    explanation: "Each product delivered a brief dopamine hit on arrival, then became part of the background. The 34th product cannot deliver the satisfaction of the first.",
  },
  {
    kind: "multiple_choice",
    question: "The lesson suggests deliberately allocating a 'fun money' budget each month. Why?",
    options: [
      "To eliminate all pleasure spending",
      "To satisfy the brain's reward-seeking in a bounded way while protecting the rest of your finances",
      "To save more by never spending it",
      "To invest only in experiences",
    ],
    correct_index: 1,
    explanation: "A fixed fun-money amount satisfies the brain's reward-seeking without letting it run unchecked. Once it's spent, it's spent.",
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

export function buildLessonSteps1_1_4(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 6 && EXERCISES_1_1_4[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_4[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_4[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_4[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_4.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_4[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
