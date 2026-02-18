/**
 * Run with: npm run db:seed (loads .env / .env.local from project root)
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import { resolve } from "path";

// Load .env then .env.local so local overrides (same order as Next.js)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const LEVEL_NAMES: Record<number, string> = {
  1: "Money Awareness",
  2: "Financial Stability",
  3: "Wealth Building",
  4: "Advanced Thinking",
  5: "Hero Phase",
};

/** 200 lessons. Checkpoint after 1.1, 1.2, 2.1, 3.1, 4.1. Boss after 1.3, 2.2, 3.3. */
const SECTIONS: { level: number; section: number; name: string; lessonStart: number; lessonEnd: number; type: "lesson" | "checkpoint" | "boss_challenge" }[] = [
  { level: 1, section: 1, name: "Money Psychology", lessonStart: 1, lessonEnd: 12, type: "lesson" },
  { level: 1, section: 1, name: "Checkpoint", lessonStart: 12, lessonEnd: 12, type: "checkpoint" },
  { level: 1, section: 2, name: "Earning & Income", lessonStart: 1, lessonEnd: 12, type: "lesson" },
  { level: 1, section: 2, name: "Checkpoint", lessonStart: 12, lessonEnd: 12, type: "checkpoint" },
  { level: 1, section: 3, name: "Tracking Money", lessonStart: 1, lessonEnd: 12, type: "lesson" },
  { level: 1, section: 3, name: "Boss Challenge", lessonStart: 12, lessonEnd: 12, type: "boss_challenge" },
  { level: 2, section: 1, name: "Banking Basics", lessonStart: 1, lessonEnd: 16, type: "lesson" },
  { level: 2, section: 1, name: "Checkpoint", lessonStart: 16, lessonEnd: 16, type: "checkpoint" },
  { level: 2, section: 2, name: "Debt & Credit", lessonStart: 1, lessonEnd: 25, type: "lesson" },
  { level: 2, section: 2, name: "Boss Challenge", lessonStart: 25, lessonEnd: 25, type: "boss_challenge" },
  { level: 2, section: 3, name: "Inflation & Time", lessonStart: 1, lessonEnd: 10, type: "lesson" },
  { level: 2, section: 4, name: "Emergency Planning", lessonStart: 1, lessonEnd: 5, type: "lesson" },
  { level: 3, section: 1, name: "Investing Basics", lessonStart: 1, lessonEnd: 20, type: "lesson" },
  { level: 3, section: 1, name: "Checkpoint", lessonStart: 20, lessonEnd: 20, type: "checkpoint" },
  { level: 3, section: 2, name: "Global Markets & Strategies", lessonStart: 1, lessonEnd: 10, type: "lesson" },
  { level: 3, section: 3, name: "Assets & Wealth Systems", lessonStart: 1, lessonEnd: 23, type: "lesson" },
  { level: 3, section: 3, name: "Boss Challenge", lessonStart: 23, lessonEnd: 23, type: "boss_challenge" },
  { level: 4, section: 1, name: "Risk & Probability", lessonStart: 1, lessonEnd: 13, type: "lesson" },
  { level: 4, section: 1, name: "Checkpoint", lessonStart: 13, lessonEnd: 13, type: "checkpoint" },
  { level: 4, section: 2, name: "Financial Traps", lessonStart: 1, lessonEnd: 17, type: "lesson" },
  { level: 4, section: 3, name: "Taxes & Society", lessonStart: 1, lessonEnd: 10, type: "lesson" },
  { level: 5, section: 1, name: "Hero Phase", lessonStart: 1, lessonEnd: 15, type: "lesson" },
];

function buildTopics(): { topic_id: string; level_number: number; section_number: number; lesson_number: number; title: string; topic_type: string; xp_reward: number; order_index: number }[] {
  const topics: { topic_id: string; level_number: number; section_number: number; lesson_number: number; title: string; topic_type: string; xp_reward: number; order_index: number }[] = [];
  let orderIndex = 0;
  for (const s of SECTIONS) {
    if (s.type === "lesson" && s.lessonStart < s.lessonEnd) {
      const count = s.lessonEnd - s.lessonStart + 1;
      for (let i = 1; i <= count; i++) {
        topics.push({
          topic_id: `${s.level}.${s.section}.${i}`,
          level_number: s.level,
          section_number: s.section,
          lesson_number: i,
          title: `Lesson ${i}`,
          topic_type: "lesson",
          xp_reward: 10,
          order_index: orderIndex++,
        });
      }
    } else if (s.type === "checkpoint") {
      topics.push({
        topic_id: `${s.level}.${s.section}.checkpoint`,
        level_number: s.level,
        section_number: s.section,
        lesson_number: s.lessonEnd,
        title: `${s.name} Quiz`,
        topic_type: "checkpoint",
        xp_reward: 25,
        order_index: orderIndex++,
      });
    } else if (s.type === "boss_challenge") {
      topics.push({
        topic_id: `${s.level}.boss`,
        level_number: s.level,
        section_number: s.section,
        lesson_number: s.lessonEnd,
        title: `Level ${s.level} Boss Challenge`,
        topic_type: "boss_challenge",
        xp_reward: 50,
        order_index: orderIndex++,
      });
    }
  }
  return topics;
}

const ACHIEVEMENTS = [
  { slug: "first_lesson", title: "First Step", description: "Complete your first lesson", icon: "🎯", xp_reward: 10 },
  { slug: "streak_7", title: "Week Warrior", description: "7-day learning streak", icon: "🔥", xp_reward: 50 },
  { slug: "streak_30", title: "Month Master", description: "30-day learning streak", icon: "💎", xp_reward: 200 },
  { slug: "rank_apprentice", title: "Apprentice", description: "Rank up to Apprentice by completing Topic 1", icon: "📘", xp_reward: 100 },
  { slug: "rank_practitioner", title: "Practitioner", description: "Rank up to Practitioner by completing Topic 2", icon: "🏦", xp_reward: 200 },
  { slug: "rank_strategist", title: "Strategist", description: "Rank up to Strategist by completing Topic 3", icon: "📈", xp_reward: 300 },
  { slug: "rank_expert", title: "Expert", description: "Rank up to Expert by completing Topic 4", icon: "🧠", xp_reward: 400 },
  { slug: "hero", title: "ArcWealth Hero", description: "Complete the full ArcWealth curriculum", icon: "🏆", xp_reward: 1000 },
  { slug: "perfect_quiz", title: "Perfect Score", description: "Score 100% on a quiz", icon: "⭐", xp_reward: 25 },
  { slug: "xp_500", title: "XP Grinder", description: "Earn 500 total XP", icon: "⚡", xp_reward: 0 },
  { slug: "profile_complete", title: "Face of Finance", description: "Upload a profile picture", icon: "📸", xp_reward: 10 },
];

const SAMPLE_TEXTBOOK = {
  type: "textbook",
  sections: [
    {
      heading: "What Is Money?",
      blocks: [
        { kind: "paragraph", text: "Money is something we use to buy things and save for later. It can be coins, bills, or numbers in an app — but it all represents value." },
        { kind: "key_concept", title: "Key idea", body: "Money is a medium of exchange. Instead of trading your sandwich for someone else's pencil, you both use money to get what you want." },
        { kind: "real_world_example", title: "In the real world", body: "You just got your first job at a coffee shop. Your paycheck is money you earned by working. You can spend it, save it, or give it — that's the power of understanding money." },
        { kind: "bullet_list", items: ["Money represents value", "It makes trading easier", "You can save it for the future"] },
      ],
    },
  ],
  key_takeaways: ["Money is a medium of exchange.", "It represents value and makes trading easier.", "You can earn, spend, and save money."],
};

const SAMPLE_LESSON = {
  type: "duolingo_lesson",
  exercises: [
    { kind: "multiple_choice", question: "What is money mainly used for?", options: ["Eating", "Exchanging for goods and services", "Sleeping", "Playing"], correct_index: 1, explanation: "Money is a medium of exchange — we use it to get what we need." },
    { kind: "true_false", statement: "Money can only be paper bills and coins.", correct: false, explanation: "Money can be physical (cash) or digital (in an app or bank account)." },
    { kind: "fill_blank", sentence: "Money is a medium of ___.", options: ["exchange", "food", "sport", "music"], correct_index: 0, explanation: "A medium of exchange is something we use to trade for goods and services." },
    { kind: "scenario", scenario: "Your friend wants your old skateboard. You agree to sell it for $20.", question: "What role is money playing here?", options: ["A gift", "A medium of exchange", "A toy", "A reward"], correct_index: 1, explanation: "You're exchanging the skateboard for money — that's using money as a medium of exchange." },
  ],
};

async function main() {
  const topics = buildTopics();
  const { error: topicsErr } = await supabase.from("topics").upsert(topics, { onConflict: "topic_id" });
  if (topicsErr) {
    console.error("Topics:", topicsErr);
    return;
  }
  console.log("Upserted", topics.length, "topics");

  const { error: achErr } = await supabase.from("achievements").upsert(ACHIEVEMENTS, { onConflict: "slug" });
  if (achErr) console.error("Achievements:", achErr);
  else console.log("Upserted", ACHIEVEMENTS.length, "achievements");

  const topicIdsForContent = ["1.1.1", "1.1.2", "1.1.3", "1.2.1", "1.2.2"];
  for (const topicId of topicIdsForContent) {
    await supabase.from("lesson_content").insert({ topic_id: topicId, content_type: "textbook", content: SAMPLE_TEXTBOOK }).then(() => {});
    await supabase.from("lesson_content").insert({ topic_id: topicId, content_type: "duolingo_lesson", content: SAMPLE_LESSON }).then(() => {});
  }
  console.log("Sample lesson content for", topicIdsForContent.length, "topics");

  const glossaryTerms = [
    // 1.1.1 — What Is Money?
    { term: "Money", definition: "Any widely accepted medium of exchange that people use to trade goods and services, store value over time, and measure the worth of things.", example: "You use money to pay for lunch.", related_topic_ids: ["1.1.1"] },
    { term: "Medium of exchange", definition: "A tool people use to trade goods and services so you don't have to find someone who has what you want and wants what you have.", example: "You give €5, you get a coffee.", related_topic_ids: ["1.1.1"] },
    { term: "Store of value", definition: "The ability of money to hold its worth over time so you can save it and spend it later.", example: "Money saved today can buy food next month.", related_topic_ids: ["1.1.1"] },
    { term: "Unit of account", definition: "A common way to measure and compare the value of things.", example: "A laptop costs $800; headphones cost $150.", related_topic_ids: ["1.1.1"] },
    // 1.1.2 — Needs vs. Wants
    { term: "Need", definition: "Something essential for basic survival, health, safety, or participation in modern life. Without it, your wellbeing is genuinely at risk.", example: "Shelter, food, basic clothing, healthcare.", related_topic_ids: ["1.1.2"] },
    { term: "Want", definition: "Something that improves comfort, enjoyment, or status, but is not required for your basic functioning and survival.", example: "Restaurants, gaming, designer clothes, streaming.", related_topic_ids: ["1.1.2"] },
    { term: "Lifestyle inflation", definition: "When wants expand as income rises, so that more income doesn't automatically mean more savings.", example: "Spending more on wants as your salary grows instead of saving the difference.", related_topic_ids: ["1.1.2"] },
    // 1.1.3 — Impulse Spending
    { term: "Impulse spending", definition: "Any unplanned purchase made in the moment, driven by emotion, environment, or external triggers rather than considered need or pre-existing intention.", example: "Buying something you didn't plan to buy after seeing an ad or while bored.", related_topic_ids: ["1.1.3"] },
    // 1.1.4 — Dopamine, Rewards, and Spending
    { term: "Dopamine", definition: "A neurotransmitter that drives motivation and reward-seeking behaviour. It is released in anticipation of a potential reward — not just when the reward is received.", example: "The urge to buy something peaks at checkout, before the item arrives.", related_topic_ids: ["1.1.4"] },
    { term: "Fixed reward schedule", definition: "A reward that comes after a predictable, consistent number of actions. You always know exactly when the reward comes.", example: "A coffee stamp card — buy 9, get the 10th free.", related_topic_ids: ["1.1.4"] },
    { term: "Variable reward schedule", definition: "A reward that comes at unpredictable intervals. You might win after 2 tries or after 200. You never know when.", example: "A slot machine, a loot box, or a social media 'like'.", related_topic_ids: ["1.1.4"] },
    { term: "Hedonic adaptation", definition: "The psychological tendency to return to a relatively stable level of happiness despite major positive or negative changes. No matter what you buy, you eventually get used to it.", example: "New trainers feel amazing for a week, then become 'just your trainers'.", related_topic_ids: ["1.1.4"] },
    // 1.1.5 — Delayed Gratification
    { term: "Delayed gratification", definition: "The ability to resist an immediate reward in favour of a larger or more valuable reward later. Self-control applied to time.", example: "Saving €50 today instead of spending it, so you have €80 in five years.", related_topic_ids: ["1.1.5"] },
    { term: "Present bias", definition: "The tendency to value immediate rewards more highly than future ones, so the brain undervalues long-term benefits.", example: "Choosing to spend now instead of save for later, even when you know saving is better.", related_topic_ids: ["1.1.5"] },
    // 1.1.6 — Money Scripts & Beliefs
    { term: "Money scripts", definition: "Unconscious beliefs about money, formed primarily in childhood through family messages, cultural context, and early experiences. They operate automatically and influence financial behaviour without conscious awareness.", example: "Believing 'money is the root of all evil' or 'more money will make me happy'.", related_topic_ids: ["1.1.6"] },
    // 1.1.7 — Emotions and Spending
    { term: "Emotional spending", definition: "Spending money primarily to regulate emotions — to escape, soothe, reward, or distract from feelings — rather than to meet a genuine need or planned want.", example: "Retail therapy after a bad day, or splurging when stressed.", related_topic_ids: ["1.1.7"] },
    // 1.1.8 — Anchoring and Pricing Psychology
    { term: "Anchoring", definition: "A cognitive bias where the first number you see (the 'anchor') disproportionately influences your perception of subsequent numbers — even when the anchor is arbitrary, irrelevant, or false.", example: "A 'was €100, now €50' label makes €50 feel like a great deal.", related_topic_ids: ["1.1.8"] },
    { term: "Left-digit effect", definition: "The tendency to give disproportionate weight to the first digit when reading a price. €29.99 is processed as '€20-something' while €30 is '€30-something'.", example: "Charm pricing (.99, .95) makes prices feel lower than the next round number.", related_topic_ids: ["1.1.8"] },
    // 1.1.9 — Scarcity vs. Abundance Mindset
    { term: "Scarcity mindset", definition: "A psychological pattern where you perceive resources (money, time, opportunities) as fundamentally limited and insufficient, leading to chronic anxiety, short-term thinking, and defensive behaviour.", example: "Avoiding investing because 'I can't afford to lose anything'.", related_topic_ids: ["1.1.9"] },
    { term: "Abundance mindset", definition: "A psychological pattern where you perceive resources as renewable and sufficient. While recognising real constraints, you focus on possibility, growth, and strategic action rather than fear.", example: "Seeing a raise as a chance to save more, not just spend more.", related_topic_ids: ["1.1.9"] },
    // 1.1.10 — Values and Money
    { term: "Values", definition: "The principles, qualities, and experiences that matter most to you — what makes life feel meaningful. In a financial context, values are the north star that should guide where your money goes.", example: "If family is a top value, spending on a reunion may be values-aligned.", related_topic_ids: ["1.1.10"] },
    { term: "Values-based spending", definition: "Spending money in ways that align with your core values, so you get more satisfaction per euro and fewer regrets.", example: "Spending on experiences you value (e.g. travel) and cutting spending that doesn't align.", related_topic_ids: ["1.1.10"] },
    // 1.1.11 — Financial Goals That Stick
    { term: "SMART goals", definition: "Goals that are Specific, Measurable, Achievable, Relevant, and Time-bound. This framework makes goals actionable and easier to track and achieve.", example: "Save €500 in a dedicated emergency fund by December 31.", related_topic_ids: ["1.1.11"] },
    { term: "Milestone", definition: "A sub-goal or checkpoint on the way to a larger goal, often set every 30–60 days. Milestones make progress visible and sustain motivation.", example: "Save €200 by end of Month 1 on the way to €3,000.", related_topic_ids: ["1.1.11"] },
    { term: "Accountability partner", definition: "Someone who checks in on your progress toward a goal, making it harder to quit and easier to stay on track.", example: "A friend you report to weekly on your savings goal.", related_topic_ids: ["1.1.11"] },
    // 1.1.12 — Habits That Build Wealth
    { term: "Habit loop", definition: "The four-stage cycle of habit: Cue (trigger) → Craving (motivation) → Routine (the behaviour) → Reward (satisfaction that reinforces the loop).", example: "Phone buzzes (cue) → want to check (craving) → scroll (routine) → dopamine hit (reward).", related_topic_ids: ["1.1.12"] },
    { term: "Cue", definition: "The trigger that starts a habit — can be a time, place, emotion, or preceding action.", example: "Walking past a café (cue) triggers buying a coffee.", related_topic_ids: ["1.1.12"] },
    { term: "Craving", definition: "In the habit loop, the motivational force behind the habit — what you want from the behaviour, not the behaviour itself.", example: "The desire to feel in control of your money that drives checking your budget.", related_topic_ids: ["1.1.12"] },
    { term: "Routine", definition: "In the habit loop, the actual action or behaviour — the habit itself.", example: "The act of transferring €50 to savings every payday.", related_topic_ids: ["1.1.12"] },
    { term: "Reward", definition: "In the habit loop, the benefit you get from the routine, which reinforces the loop and makes you want to repeat it.", example: "Feeling of security from seeing savings grow.", related_topic_ids: ["1.1.12"] },
    { term: "Automate savings", definition: "Setting up automatic transfers from checking to savings or investment accounts (e.g. the day after payday) so you save without relying on willpower.", example: "10% of each paycheck goes to savings automatically.", related_topic_ids: ["1.1.12"] },
    { term: "The Dip", definition: "The period around Week 3 of building a new habit when effort and difficulty peak and many people quit. Pushing through the dip leads to the habit becoming easier.", example: "Wanting to skip your new savings habit in week 3 — that's the dip.", related_topic_ids: ["1.1.12"] },
    // 1.2.1 — What Is Income?
    { term: "Income", definition: "Any money received from any source — work, investments, or assets. The foundation of personal finance; differs by how it's earned, taxed, and whether it requires your time.", example: "Your paycheck, dividends, or rent from a property are all income.", related_topic_ids: ["1.2.1"] },
    { term: "Gross income", definition: "The total amount you earn before any deductions. The headline number on your job offer, contract, or payslip — not the amount that arrives in your bank account.", example: "A job offer of €35,000 per year is quoting gross income.", related_topic_ids: ["1.2.1", "1.2.3"] },
    { term: "Net income", definition: "Take-home pay: the amount that actually lands in your bank account after taxes, social insurance, pension contributions, and other mandatory deductions.", example: "€35,000 gross might become roughly €25,600 net depending on where you live.", related_topic_ids: ["1.2.1", "1.2.3"] },
    { term: "Active income", definition: "Money earned directly in exchange for your time and effort. If you stop working, it stops. Includes salary, wages, freelance fees, and commissions.", example: "A monthly salary or hourly wage is active income.", related_topic_ids: ["1.2.1"] },
    { term: "Portfolio income", definition: "Returns from owning financial assets — dividends, interest, capital gains. Requires capital to invest; can grow without your active involvement but is subject to market risk.", example: "Dividends from shares or interest from bonds.", related_topic_ids: ["1.2.1"] },
    { term: "Passive income", definition: "Earnings that continue with minimal ongoing work after initial effort or investment — e.g. rental income, royalties, revenue from digital products. Rarely truly passive; often needs upkeep.", example: "Rent from a property or royalties from a book.", related_topic_ids: ["1.2.1"] },
    // 1.2.2 — Salary, Wages, and Paychecks
    { term: "Salary", definition: "A fixed amount of money paid to an employee annually, regardless of hours worked. Usually divided into equal periodic payments (e.g. monthly or bi-weekly).", example: "€35,000/year paid in 12 monthly installments of €2,917.", related_topic_ids: ["1.2.2"] },
    { term: "Wage", definition: "Payment per unit of time worked (usually per hour). Total pay varies with actual hours worked; no fixed annual guarantee.", example: "€15/hour × 40 hours = €600 that week.", related_topic_ids: ["1.2.2"] },
    { term: "Overtime", definition: "Hours worked beyond the standard threshold (e.g. 40/week). Often paid at a higher rate (e.g. 1.5× or 2×) for waged employees; salaried staff may not receive extra pay.", example: "10 hours overtime at 1.5× = 15 hours’ pay.", related_topic_ids: ["1.2.2"] },
    { term: "Pay frequency", definition: "How often you are paid: monthly (12 times/year), bi-weekly (26), or weekly (52). Same annual amount can mean very different cash flow patterns.", example: "Bi-weekly pay means two 'bonus' months per year with three paychecks.", related_topic_ids: ["1.2.2"] },
    // 1.2.3 — Net vs. Gross Income
    { term: "Deductions", definition: "Amounts taken from gross pay before you receive it: income tax, social insurance, USC/levies, and pension contributions. They reduce gross to net (take-home).", example: "On €35,000 gross, deductions might total around €9,370, leaving €25,630 net.", related_topic_ids: ["1.2.3"] },
    { term: "Progressive taxation", definition: "A system where higher earners pay a higher percentage of their income in tax. Take-home percentage falls as gross income rises; doubling gross does not double net.", example: "At €30,000 you might keep 78% net; at €100,000 perhaps 61%.", related_topic_ids: ["1.2.3"] },
    // 1.2.4 — How to Read a Payslip
    { term: "Payslip", definition: "A document from your employer each pay period showing gross pay, all deductions, net pay, and year-to-date totals. A receipt and record for verification, loans, and tax.", example: "Check every payslip for correct tax code, hours, and net amount.", related_topic_ids: ["1.2.4"] },
    { term: "Tax code", definition: "A code from the tax authority that tells your employer how much tax to deduct. Wrong codes (e.g. 0T emergency) cause over-deduction; get the correct code to payroll within the first month.", example: "1250L = standard allowance; 0T = no allowance, maximum tax.", related_topic_ids: ["1.2.4"] },
    { term: "Gross pay", definition: "Total earnings in a pay period before any deductions — salary/wages, overtime, bonuses, allowances. The sum of all earnings lines on a payslip.", example: "Basic €2,917 + overtime €109 + bonus €500 = €3,526 gross pay.", related_topic_ids: ["1.2.4"] },
    { term: "Net pay", definition: "Take-home amount for that pay period after all deductions. Must match what actually arrives in your bank account.", example: "If net pay on the payslip is €2,136, your bank should show €2,136.", related_topic_ids: ["1.2.4"] },
    { term: "Year-to-date (YTD)", definition: "Cumulative totals from the start of the tax year: gross, tax paid, other deductions, and net. Shown on payslips and needed for tax returns.", example: "YTD net after six months helps you confirm you're on track for the year.", related_topic_ids: ["1.2.4"] },
  ];
  const { error: glossErr } = await supabase.from("glossary").upsert(glossaryTerms, { onConflict: "term" });
  if (glossErr) console.error("Glossary:", glossErr);
  else console.log("Upserted", glossaryTerms.length, "glossary terms");

  console.log("Seed done.");
}

main();
