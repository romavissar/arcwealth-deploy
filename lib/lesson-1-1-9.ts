import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.9 Scarcity vs. Abundance Mindset, aligned with textbook sections. */
const EXERCISES_1_1_9: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is scarcity mindset?",
    options: [
      "Having very little money",
      "A psychological pattern where you perceive resources as fundamentally limited and insufficient, leading to anxiety and short-term thinking",
      "Being frugal",
      "Avoiding luxury",
    ],
    correct_index: 1,
    explanation:
      "Scarcity mindset is the perception that resources (money, time, opportunities) are limited and insufficient — which drives fear-based behaviour. It's different from actual poverty.",
  },
  {
    kind: "true_false",
    statement: "Research shows that when people are worried about money, their effective cognitive capacity drops by about 13–14 points — they make worse decisions when they most need to make good ones.",
    correct: true,
    explanation: "Scarcity reduces cognitive bandwidth and causes 'tunneling' — hyper-focus on the immediate problem and neglect of long-term solutions.",
  },
  {
    kind: "multiple_choice",
    question: "How does the scarcity spiral perpetuate itself?",
    options: [
      "By earning more money",
      "Scarcity belief → fear-based choices → missed opportunities → poor outcomes → reinforced belief → increased anxiety → stronger scarcity belief",
      "By saving more",
      "It doesn't — it's a myth",
    ],
    correct_index: 1,
    explanation: "The spiral is self-reinforcing. Poor outcomes are interpreted as confirmation that 'there isn't enough,' which increases fear and narrows thinking further.",
  },
  {
    kind: "multiple_choice",
    question: "According to the lesson, abundance mindset is NOT which of the following?",
    options: [
      "Strategic optimism grounded in action",
      "Ignoring real problems or toxic positivity",
      "Taking calculated risks",
      "Long-term thinking",
    ],
    correct_index: 1,
    explanation: "Abundance isn't pretending problems don't exist or 'manifesting.' It's believing you have agency and can create resources — and acting on that belief.",
  },
  {
    kind: "true_false",
    statement: "People with scarcity mindset and abundance mindset show similar savings rates, financial stress, and income growth in studies.",
    correct: false,
    explanation: "Mindset drives behaviour: abundance leads to calculated risks and investment in growth; scarcity leads to risk avoidance and stagnation.",
  },
  {
    kind: "multiple_choice",
    question: "What is the most effective strategy cited for building abundance mindset?",
    options: [
      "Ignoring bills",
      "Tracking wins and progress — a written log of financial progress and problems solved",
      "Spending more",
      "Avoiding risk entirely",
    ],
    correct_index: 1,
    explanation: "Tracking wins (92% effectiveness) counters scarcity's deficit focus by forcing attention to what is working. Scarcity is maintained by selective attention to failure.",
  },
  {
    kind: "scenario",
    scenario: "Liam was offered a €200 course. His first thought was 'I can't afford that.' He then calculated: if it helps him charge €50/month more, it pays for itself in 4 months. He took it; within 6 months his rates rose. The €200 generated €3,000+ extra annual income.",
    question: "What does this illustrate?",
    options: [
      "Courses are always worth it",
      "Scarcity focuses on immediate cost; abundance calculates ROI and lifetime value",
      "Liam was undercharging",
      "€200 is cheap",
    ],
    correct_index: 1,
    explanation: "The scarcity response is 'I can't afford it.' The abundance response is 'What's the ROI?' One sees cost; the other sees investment.",
  },
  {
    kind: "multiple_choice",
    question: "How long does the lesson suggest it typically takes to notice a shift in mindset from consistent practice?",
    options: ["1 day", "1 week", "6–12 weeks of consistent practice", "1 year only"],
    correct_index: 2,
    explanation: "Scarcity mindset may have decades of reinforcement. Abundance thinking builds gradually through repeated practice — like strength training for the brain.",
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

export function buildLessonSteps1_1_9(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 6 && EXERCISES_1_1_9[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_9[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_9[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_9[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_9.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_9[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
