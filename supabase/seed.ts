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
  { slug: "rank_apprentice", title: "Apprentice", description: "Rank up to Apprentice by completing Level 1", icon: "📘", xp_reward: 100 },
  { slug: "rank_practitioner", title: "Practitioner", description: "Rank up to Practitioner by completing Level 2", icon: "🏦", xp_reward: 200 },
  { slug: "rank_strategist", title: "Strategist", description: "Rank up to Strategist by completing Level 3", icon: "📈", xp_reward: 300 },
  { slug: "rank_expert", title: "Expert", description: "Rank up to Expert by completing Level 4", icon: "🧠", xp_reward: 400 },
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
    { term: "Money", definition: "A medium of exchange used to buy goods and services.", example: "You use money to pay for lunch.", related_topic_ids: ["1.1.1"] },
    { term: "Medium of exchange", definition: "Something widely accepted in return for goods and services.", example: "Money is a medium of exchange.", related_topic_ids: ["1.1.1"] },
    { term: "Income", definition: "Money you receive, usually from working or investments.", example: "Your paycheck is income.", related_topic_ids: ["1.2.1"] },
  ];
  const { error: glossErr } = await supabase.from("glossary").upsert(glossaryTerms, { onConflict: "term" });
  if (glossErr) console.error("Glossary:", glossErr);
  else console.log("Upserted", glossaryTerms.length, "glossary terms");

  console.log("Seed done.");
}

main();
