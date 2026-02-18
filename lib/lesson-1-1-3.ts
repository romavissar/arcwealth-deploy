import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.3 Impulse Spending, aligned with textbook sections. */
const EXERCISES_1_1_3: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "According to the lesson, what is impulse spending?",
    options: [
      "Any purchase over €50",
      "Any unplanned purchase made in the moment, driven by emotion, environment, or external triggers rather than considered need",
      "Only in-store purchases",
      "Purchases made with cash",
    ],
    correct_index: 1,
    explanation:
      "Impulse spending is any unplanned purchase made in the moment, driven by emotion, environment, or external triggers rather than considered need or pre-existing intention.",
  },
  {
    kind: "true_false",
    statement: "Dopamine peaks when you anticipate a reward (e.g. deciding to buy something), not when you actually receive it — which helps create a feedback loop that reinforces impulse buying.",
    correct: true,
    explanation: "Research shows dopamine peaks at anticipation. The moment you decide to buy, you already feel good, which reinforces the behaviour.",
  },
  {
    kind: "multiple_choice",
    question: "What are the six stages of the impulse spending cycle?",
    options: [
      "See, Want, Buy, Regret, Return, Forget",
      "Trigger, Desire, Purchase, Brief High, Regret, Rationalise",
      "Ad, Click, Checkout, Delivery, Open, Regret",
      "Boredom, Browse, Cart, Pay, Unbox, Repeat",
    ],
    correct_index: 1,
    explanation: "The cycle is Trigger → Desire → Purchase → Brief High → Regret → Rationalise. Rationalisation closes the loop and makes the next impulse easier.",
  },
  {
    kind: "multiple_choice",
    question: "Why is the impulse cycle hard to break?",
    options: [
      "Because items are too cheap",
      "Because the rationalisation stage neutralises regret, so the lesson rarely sticks",
      "Because shops are open 24 hours",
      "Because credit cards have high limits",
    ],
    correct_index: 1,
    explanation: "By the time regret sets in, the brain rationalises the purchase ('it was on sale', 'I deserved it'), which closes the loop and makes the next impulse easier.",
  },
  {
    kind: "multiple_choice",
    question: "What is the single most evidence-backed strategy for reducing impulse spending?",
    options: [
      "Cancelling all subscriptions",
      "Waiting before you buy — desire drops sharply within 24–48 hours for most items",
      "Only shopping in person",
      "Setting a strict daily spending limit",
    ],
    correct_index: 1,
    explanation: "The waiting period is the most effective strategy: the desire to buy is strongest at the moment of trigger and declines rapidly with time.",
  },
  {
    kind: "true_false",
    statement: "Adding friction to purchases (e.g. removing saved card details or using a wishlist) has no effect on whether people complete impulse buys.",
    correct: false,
    explanation: "Retailers remove friction to make you spend more; you can add it back deliberately. Friction doesn't make buying impossible, it creates a pause.",
  },
  {
    kind: "scenario",
    scenario: "Lucas spent €61 on in-game purchases in a month across many small transactions (€2–€15 each). He was shocked when he saw his bank statement.",
    question: "What does this illustrate?",
    options: [
      "Games are too expensive",
      "Digital spending bypasses the psychological 'pain' of handing over cash; small purchases feel insignificant but add up",
      "Teenagers should not have bank cards",
      "In-app purchases are always a scam",
    ],
    correct_index: 1,
    explanation: "Digital spending — especially in apps — makes small purchases feel trivial. Studies show people spend 15–30% more when paying by card or phone than with cash.",
  },
  {
    kind: "multiple_choice",
    question: "For a purchase between €100–€500, what waiting period does the lesson suggest?",
    options: ["30 minutes", "24–48 hours", "1 week", "2–4 weeks"],
    correct_index: 2,
    explanation: "€100–€500: 1 week — time to research alternatives, compare prices, and check your budget. Over €500: 2–4 weeks.",
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

export function buildLessonSteps1_1_3(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 6 && EXERCISES_1_1_3[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_3[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_3[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_3[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_3.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_3[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
