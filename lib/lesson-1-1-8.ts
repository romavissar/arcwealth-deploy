import type { LessonExercise, LessonStep } from "@/types/curriculum";

/** Exercises for 1.1.8 Anchoring and Pricing Psychology, aligned with textbook sections. */
const EXERCISES_1_1_8: LessonExercise[] = [
  {
    kind: "multiple_choice",
    question: "What is anchoring?",
    options: [
      "A type of discount",
      "A cognitive bias where the first number you see disproportionately influences your perception of subsequent numbers — even when the anchor is arbitrary or false",
      "A way to pay in installments",
      "A loyalty programme",
    ],
    correct_index: 1,
    explanation:
      "Anchoring is when the first number (the anchor) shapes how you judge later numbers. Retailers use fake 'Was' prices so the real price feels like a deal.",
  },
  {
    kind: "true_false",
    statement: "The left-digit effect means €19.99 is processed as '€19-ish' rather than 'almost €20,' which can increase willingness to buy by 15–30% compared to €20.00.",
    correct: true,
    explanation: "The brain reads left to right and weights the first digit most. .99 pricing exploits this at round-number thresholds.",
  },
  {
    kind: "multiple_choice",
    question: "What is the decoy effect?",
    options: [
      "A type of discount for loyal customers",
      "Adding a deliberately poor third option so that one of the other options looks better and more people choose it",
      "Hiding fees until checkout",
      "Using round numbers for luxury goods",
    ],
    correct_index: 1,
    explanation: "The decoy (e.g. a badly priced medium) exists to make another option (e.g. large) look like great value. Choices shift without changing the other options.",
  },
  {
    kind: "multiple_choice",
    question: "Which tactic involves showing a low base price and adding fees later (e.g. baggage, booking fees)?",
    options: ["Charm pricing", "Price anchoring", "Drip pricing", "Prestige pricing"],
    correct_index: 2,
    explanation: "Drip pricing advertises a low price and adds fees during checkout, exploiting sunk cost — you've already invested time and commitment.",
  },
  {
    kind: "true_false",
    statement: "Showing a price as '€2.50/day' instead of '€912/year' has no effect on how people perceive the cost.",
    correct: false,
    explanation: "Price framing works: small time units make the same amount feel smaller. Always convert to annual cost to compare fairly.",
  },
  {
    kind: "multiple_choice",
    question: "What is the most powerful counter-question suggested in the lesson?",
    options: [
      "Is it on sale?",
      "Would I buy this at full price? — If no, the only reason you want it is the manipulation",
      "Do I have a coupon?",
      "Is it the cheapest option?",
    ],
    correct_index: 1,
    explanation: "If you wouldn't pay full price, you don't actually want the item — the discount is just manipulation. Walk away.",
  },
  {
    kind: "scenario",
    scenario: "A cinema offers Small $5 (4 cups), Medium $8 (6 cups), Large $9 (10 cups). Medium is terrible value per cup; large is much better value. When researchers removed the medium option, large sales dropped 22%.",
    question: "What does this show?",
    options: [
      "People prefer small",
      "The medium acts as a decoy — it exists to make large look good; without it, people choose what they actually want (often small)",
      "Large is overpriced",
      "Cinema popcorn is unhealthy",
    ],
    correct_index: 1,
    explanation: "The decoy's only purpose is to shift choices. When removed, behaviour reverts to what people really want.",
  },
  {
    kind: "multiple_choice",
    question: "According to the lesson, what is the estimated lifetime opportunity cost of consistently falling for pricing psychology tactics?",
    options: ["€10,000", "€50,000", "€260,000+ over 40 years", "€1 million"],
    correct_index: 2,
    explanation: "Conservative estimates put extra spending at €1,680/year; over 40 years at 6% growth that's €260,400+ in lost wealth.",
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

export function buildLessonSteps1_1_8(markdown: string): LessonStep[] {
  const sections = splitMarkdownIntoSections(markdown);
  const steps: LessonStep[] = [];
  let exerciseIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    if (body.length < 15) continue;

    steps.push({ type: "content", title, body });

    const sectionNum = title.match(/^(\d+)/)?.[1];
    const num = sectionNum ? parseInt(sectionNum, 10) : 0;
    if (num >= 1 && num <= 6 && EXERCISES_1_1_8[exerciseIndex]) {
      steps.push({ type: "exercise", exercise: EXERCISES_1_1_8[exerciseIndex] });
      exerciseIndex++;
      if (num <= 2 && EXERCISES_1_1_8[exerciseIndex]) {
        steps.push({ type: "exercise", exercise: EXERCISES_1_1_8[exerciseIndex] });
        exerciseIndex++;
      }
    }
  }

  while (exerciseIndex < EXERCISES_1_1_8.length) {
    steps.push({ type: "exercise", exercise: EXERCISES_1_1_8[exerciseIndex] });
    exerciseIndex++;
  }

  return steps;
}
