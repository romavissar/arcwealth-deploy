/**
 * Run with: npm run db:seed (loads .env / .env.local from project root)
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Curriculum is empty by default — add sections/topics here when you restructure.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { LESSON_TITLES } from "@/lib/curriculum";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

/** Add section rows here to match `lib/curriculum.ts` and `lib/progress.ts` when you define the path. */
const SECTIONS: {
  level: number;
  section: number;
  name: string;
  lessonStart: number;
  lessonEnd: number;
  type: "lesson" | "checkpoint" | "boss_challenge";
}[] = [];

function buildTopics(): {
  topic_id: string;
  level_number: number;
  section_number: number;
  lesson_number: number;
  title: string;
  topic_type: string;
  xp_reward: number;
  order_index: number;
}[] {
  const topics: {
    topic_id: string;
    level_number: number;
    section_number: number;
    lesson_number: number;
    title: string;
    topic_type: string;
    xp_reward: number;
    order_index: number;
  }[] = [];
  let orderIndex = 0;
  for (const s of SECTIONS) {
    if (s.type === "lesson" && s.lessonStart < s.lessonEnd) {
      const count = s.lessonEnd - s.lessonStart + 1;
      for (let i = 1; i <= count; i++) {
        const topic_id = `${s.level}.${s.section}.${i}`;
        topics.push({
          topic_id,
          level_number: s.level,
          section_number: s.section,
          lesson_number: i,
          title: LESSON_TITLES[topic_id] ?? `Lesson ${i}`,
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

async function main() {
  const topics = buildTopics();
  if (topics.length > 0) {
    const { error: topicsErr } = await supabase.from("topics").upsert(topics, { onConflict: "topic_id" });
    if (topicsErr) {
      console.error("Topics:", topicsErr);
      return;
    }
    console.log("Upserted", topics.length, "topics");
  } else {
    console.log("No topics to seed (empty curriculum).");
  }

  const { error: achErr } = await supabase.from("achievements").upsert(ACHIEVEMENTS, { onConflict: "slug" });
  if (achErr) console.error("Achievements:", achErr);
  else console.log("Upserted", ACHIEVEMENTS.length, "achievements");

  console.log("Seed done.");
}

main();
