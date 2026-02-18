import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.7 Emotions and Spending, aligned with textbook sections. */
const EXERCISES_1_1_7: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is emotional spending?",
    options: [
      "Spending only on essentials",
      "Spending money primarily to regulate emotions — to escape, soothe, reward, or distract — rather than to meet a genuine need or planned want",
      "Spending when you are happy",
      "Spending with a credit card",
    ],
    correct_index: 1,
    explanation:
      "Emotional spending is using purchases to manage feelings rather than to meet needs. 'Retail therapy' is the marketing rebrand of this coping mechanism.",
  },
  {
    kind: "true_false",
    statement: "Stress and anxiety are the most common emotional triggers for spending, followed by boredom and sadness.",
    correct: true,
    explanation: "Research shows stress (72%), boredom (68%), and sadness (61%) are among the top triggers. The brain seeks relief; shopping provides temporary distraction.",
  },
  {
    kind: "multiple_choice",
    question: "Why is the emotional spending cycle hard to break?",
    options: [
      "Because items are cheap",
      "Each completion strengthens the neural pathway (emotion → shopping → relief) and alternative coping strategies atrophy",
      "Because shops are open 24 hours",
      "Because everyone does it",
    ],
    correct_index: 1,
    explanation: "The brain learns the pattern and it becomes automatic; meanwhile you don't develop other ways to cope. Breaking the cycle requires intervening before the purchase.",
  },
  {
    kind: "multiple_choice",
    question: "According to the lesson, what is the key difference between retail therapy and healthier coping?",
    options: [
      "Retail therapy is cheaper",
      "Retail therapy gives faster immediate relief but shorter duration and worse long-term effectiveness; healthier coping takes more effort upfront but lasts longer and costs nothing",
      "Healthier coping is faster",
      "There is no difference",
    ],
    correct_index: 1,
    explanation: "Shopping gives a fast hit (30 min) that fades; healthier strategies provide longer relief (4+ hours), better long-term effectiveness, and €0 cost.",
  },
  {
    kind: "true_false",
    statement: "The STOP framework recommends buying immediately to relieve the emotion, then reflecting later.",
    correct: false,
    explanation: "The pause creates space for choice. You can't stop emotional spending by willpower alone — you need a system like STOP.",
  },
  {
    kind: "multiple_choice",
    question: "What does the 24-hour rule achieve?",
    options: [
      "You save 24 hours of interest",
      "Research shows 60–70% of emotional purchase urges disappear within 24 hours once the triggering emotion has passed",
      "You get a discount after 24 hours",
      "It has no effect",
    ],
    correct_index: 1,
    explanation: "Emotional spending is driven by temporary emotional states. When the emotion fades, so does the desire — so waiting eliminates most urges.",
  },
  {
    kind: "scenario",
    scenario: "Nina was spending €200–300/month during exam periods on online shopping. She deleted shopping apps and built a stress kit (gym, call sister, one comfort show episode, bath). Next exam period she spent €40 instead of €250.",
    question: "What does this show?",
    options: [
      "Shopping apps are bad",
      "Emotional spending doesn't reduce stress — it adds financial stress; having specific non-spending alternatives lets you manage stress differently",
      "She failed her exams",
      "Baths are better than shopping",
    ],
    correct_index: 1,
    explanation: "She still felt stressed but managed it without spending. Emotional spending adds a second problem (money guilt) to the first (exam stress).",
  },
  {
    kind: "multiple_choice",
    question: "What should an 'emergency coping kit' contain?",
    options: [
      "Credit cards and shopping apps",
      "10 specific, non-spending responses to negative emotions — written down in advance so they're ready when you're upset",
      "Only exercise",
      "A budget spreadsheet",
    ],
    correct_index: 1,
    explanation: "When you're upset is not the time to think of alternatives. Have 10 concrete, actionable options written down — e.g. 'Text Sarah', 'Do 10 jumping jacks'.",
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

export function buildLessonSteps1_1_7(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 6 && EXERCISES_1_1_7[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_7[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_7[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_7[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_7.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_7[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
