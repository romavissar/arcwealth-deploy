import type { LessonExercise } from "@/types/curriculum";

/**
 * Checkpoint quiz for Money Psychology (1.1.1–1.1.12).
 * 30 questions: 10 repeats from lesson quizzes + 20 new (from same topics, not used in prior levels/quizzes).
 */
export const CHECKPOINT_1_1_EXERCISES: LessonExercise[] = [
  // —— REPEATS (10) ——
  {
    kind: "multiple_choice",
    question: "According to the lesson, what gives money its value?",
    options: [
      "The material it's made of (e.g. paper or metal)",
      "Collective trust and shared agreement in society",
      "Government printing",
      "The central bank",
    ],
    correct_index: 1,
    explanation: "Money gets its power from trust and shared belief — not from the material it's made of.",
  },
  {
    kind: "multiple_choice",
    question: "Which of these is NOT one of the three core functions of money?",
    options: ["Medium of exchange", "Store of value", "Unit of account", "Unit of production"],
    correct_index: 3,
    explanation: "The three functions are medium of exchange, store of value, and unit of account.",
  },
  {
    kind: "multiple_choice",
    question: "What is lifestyle inflation?",
    options: [
      "When prices go up every year",
      "When wants expand as income rises, so more income doesn't automatically mean more savings",
      "When you only buy needs",
      "When the government prints more money",
    ],
    correct_index: 1,
    explanation: "Lifestyle inflation is when you spend more on wants as income grows instead of saving the difference.",
  },
  {
    kind: "true_false",
    statement: "Dopamine peaks when you anticipate a reward (e.g. deciding to buy), not only when you receive it.",
    correct: true,
    explanation: "That peak at anticipation helps create a feedback loop that reinforces impulse buying.",
  },
  {
    kind: "multiple_choice",
    question: "What is a variable reward schedule?",
    options: [
      "A reward after a fixed number of actions (e.g. every 10th coffee free)",
      "A reward at unpredictable intervals — you never know when it comes",
      "A reward that never comes",
      "A reward that changes in size only",
    ],
    correct_index: 1,
    explanation: "Variable rewards (e.g. slot machines, social media likes) are highly habit-forming because of unpredictability.",
  },
  {
    kind: "multiple_choice",
    question: "What does the lesson say is most effective for building delayed gratification?",
    options: [
      "Relying on willpower alone",
      "Structural strategies — e.g. automating savings — rather than willpower alone",
      "Avoiding all temptations forever",
      "Only setting very small goals",
    ],
    correct_index: 1,
    explanation: "Structural strategies (automate savings, make temptation harder to reach) work better than willpower alone.",
  },
  {
    kind: "multiple_choice",
    question: "Which are the four money script categories identified in the lesson?",
    options: [
      "Save, Spend, Invest, Donate",
      "Money Avoidance, Money Worship, Money Vigilance, Money Status",
      "Earn, Budget, Save, Retire",
      "Cash, Card, Crypto, Gold",
    ],
    correct_index: 1,
    explanation: "Klontz & Britt's four categories are Money Avoidance, Money Worship, Money Vigilance, and Money Status.",
  },
  {
    kind: "multiple_choice",
    question: "What are the most common emotional triggers for spending cited in the lesson?",
    options: [
      "Joy and celebration",
      "Stress and anxiety, followed by boredom and sadness",
      "Love and gratitude",
      "Curiosity only",
    ],
    correct_index: 1,
    explanation: "Stress and anxiety are the most common triggers, then boredom and sadness.",
  },
  {
    kind: "multiple_choice",
    question: "What does SMART stand for in goal-setting?",
    options: [
      "Simple, Meaningful, Achievable, Realistic, Timely",
      "Specific, Measurable, Achievable, Relevant, Time-bound",
      "Save, Monitor, Adjust, Review, Track",
      "Short, Medium, And Long-Term",
    ],
    correct_index: 1,
    explanation: "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound.",
  },
  {
    kind: "multiple_choice",
    question: "What are the four stages of the habit loop?",
    options: [
      "Plan, Act, Review, Reward",
      "Cue, Craving, Routine, Reward",
      "Think, Do, Check, Repeat",
      "Trigger, Action, Result, Reinforce",
    ],
    correct_index: 1,
    explanation: "Cue (trigger) → Craving (motivation) → Routine (behaviour) → Reward (satisfaction that reinforces the loop).",
  },

  // —— NEW (20) — from 1.1.1–1.1.12, not in prior quizzes ——
  // 1.1.1
  {
    kind: "multiple_choice",
    question: "When money fails as a store of value (e.g. during extreme inflation), what often happens?",
    options: [
      "People save more of it",
      "People stop trusting it as a medium of exchange too",
      "Governments print less",
      "Banks charge lower fees",
    ],
    correct_index: 1,
    explanation: "The three functions are interdependent. Zimbabwe in 2008 is an example — when the currency lost value, people abandoned it entirely.",
  },
  {
    kind: "multiple_choice",
    question: "Which property of money means 'can be split into smaller units without losing value'?",
    options: ["Durability", "Portability", "Divisibility", "Uniformity"],
    correct_index: 2,
    explanation: "Divisibility means you can split it — e.g. $1 = 100 cents. Durability is about not rotting; portability is about carrying it; uniformity is about each unit being identical.",
  },
  // 1.1.2
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
    explanation: "A need is something essential for basic survival, health, safety, or participation in modern life. Without it, your wellbeing is genuinely at risk.",
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
  // 1.1.3
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
    explanation: "Impulse spending is any unplanned purchase made in the moment, driven by emotion, environment, or external triggers rather than considered need or pre-existing intention.",
  },
  // 1.1.4
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
  // 1.1.5
  {
    kind: "multiple_choice",
    question: "What is present bias (hyperbolic discounting)?",
    options: [
      "Preferring to save for the future",
      "The tendency to give disproportionately more weight to rewards available immediately than to rewards available later",
      "A type of investment strategy",
      "Bias against spending money",
    ],
    correct_index: 1,
    explanation: "Present bias means the brain treats 'now' as far more important than 'later' — €100 in a year feels worth much less than €100 today.",
  },
  {
    kind: "multiple_choice",
    question: "When pension plans use automatic enrollment (opt-out) instead of opt-in, what typically happens to participation?",
    options: [
      "It stays the same",
      "It drops slightly",
      "It jumps to around 85–95% (from ~40–50%)",
      "It becomes mandatory",
    ],
    correct_index: 2,
    explanation: "Making the long-term choice the default nearly doubles participation. Same benefit, same choice — different default, dramatically different outcome.",
  },
  // 1.1.6
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
    explanation: "Money scripts are unconscious beliefs about money, formed primarily in childhood through family, culture, and early experiences. They operate automatically.",
  },
  {
    kind: "multiple_choice",
    question: "Which money script is associated with the highest savings rate and lowest credit card debt, but also with chronic anxiety and difficulty enjoying wealth?",
    options: ["Money Avoidance", "Money Worship", "Money Vigilance", "Money Status"],
    correct_index: 2,
    explanation: "Money Vigilance produces high savings and low debt but often comes with anxiety and inability to enjoy money.",
  },
  // 1.1.7
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
    explanation: "Emotional spending is using purchases to manage feelings rather than to meet needs. 'Retail therapy' is the marketing rebrand of this coping mechanism.",
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
  // 1.1.8
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
    explanation: "Anchoring is when the first number (the anchor) shapes how you judge later numbers. Retailers use fake 'Was' prices so the real price feels like a deal.",
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
  // 1.1.9
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
    explanation: "Scarcity mindset is the perception that resources (money, time, opportunities) are limited and insufficient — which drives fear-based behaviour. It's different from actual poverty.",
  },
  // 1.1.10
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
    explanation: "Values are what you genuinely care about — not morals or social pressure. When spending aligns with your values, it brings lasting satisfaction; when it conflicts, it brings regret.",
  },
  // 1.1.11
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
  // 1.1.12
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
];
