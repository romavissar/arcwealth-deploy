"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getLevelFromXP } from "@/lib/xp";
import { getRankForCurriculumLevel } from "@/lib/ranks";
import { applyRegeneration } from "@/lib/hearts";
import type { SupabaseClient } from "@supabase/supabase-js";

const FIRST_ACTIVITY_OF_DAY_BONUS_XP = 5;

/** Grants an achievement to the user and adds its xp_reward to their total XP. Idempotent (no-op if already earned). */
async function grantAchievement(
  supabase: SupabaseClient,
  userId: string,
  achievementSlug: string
): Promise<void> {
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", userId)
    .eq("achievement_slug", achievementSlug)
    .maybeSingle();
  if (existing) return;

  const { data: achievement } = await supabase
    .from("achievements")
    .select("xp_reward")
    .eq("slug", achievementSlug)
    .single();
  const xpReward = achievement?.xp_reward ?? 0;

  if (xpReward > 0) {
    const { data: profile } = await supabase.from("user_profiles").select("xp").eq("id", userId).single();
    const currentXp = profile?.xp ?? 0;
    const newXp = currentXp + xpReward;
    const level = getLevelFromXP(newXp);
    await supabase
      .from("user_profiles")
      .update({ xp: newXp, level, updated_at: new Date().toISOString() })
      .eq("id", userId);
    await supabase.from("xp_events").insert({
      user_id: userId,
      amount: xpReward,
      reason: `Achievement: ${achievementSlug}`,
    });
  }

  await supabase.from("user_achievements").insert({
    user_id: userId,
    achievement_slug: achievementSlug,
  });
}

/** Mark any nudges for this student whose suggested lesson is this topic as read (hides dashboard popup, marks in bell). */
async function markNudgesForTopicRead(
  supabase: SupabaseClient,
  userId: string,
  topicId: string
): Promise<void> {
  await supabase
    .from("teacher_nudges")
    .update({ read_at: new Date().toISOString() })
    .eq("student_user_id", userId)
    .eq("next_topic_id", topicId)
    .is("read_at", null);
}

/** Achievement slug -> requirement check. Returns true if the user has met the requirement (so they can collect it). */
async function checkAchievementRequirement(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
  profile: { xp: number; streak_days: number; rank: string; avatar_url: string | null },
  earnedSet: Set<string>,
  hasCompletedLesson: boolean,
  hasPerfectQuiz: boolean
): Promise<boolean> {
  if (earnedSet.has(slug)) return false;
  switch (slug) {
    case "first_lesson":
      return hasCompletedLesson;
    case "streak_7":
      return profile.streak_days >= 7;
    case "streak_30":
      return profile.streak_days >= 30;
    case "rank_apprentice":
      return ["apprentice", "practitioner", "strategist", "expert", "hero"].includes(profile.rank);
    case "rank_practitioner":
      return ["practitioner", "strategist", "expert", "hero"].includes(profile.rank);
    case "rank_strategist":
      return ["strategist", "expert", "hero"].includes(profile.rank);
    case "rank_expert":
      return ["expert", "hero"].includes(profile.rank);
    case "hero":
      return profile.rank === "hero";
    case "perfect_quiz":
      return hasPerfectQuiz;
    case "xp_500":
      return profile.xp >= 500;
    case "profile_complete":
      return !!profile.avatar_url?.trim();
    default:
      return false;
  }
}

/** Checks all achievement requirements and grants any the user has earned but not yet collected. Call e.g. when opening the achievements page. */
export async function syncAchievements(): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const [profileRes, earnedRes, progressRes, topicsRes, achievementsRes] = await Promise.all([
    supabase.from("user_profiles").select("xp, streak_days, rank, avatar_url").eq("id", userId).single(),
    supabase.from("user_achievements").select("achievement_slug").eq("user_id", userId),
    supabase.from("user_progress").select("topic_id, status, score").eq("user_id", userId),
    supabase.from("topics").select("topic_id, topic_type"),
    supabase.from("achievements").select("slug"),
  ]);

  const profile = profileRes.data;
  if (!profile) return { error: "Profile not found" };

  const topics = topicsRes.data ?? [];
  const lessonTopicIds = new Set(topics.filter((t) => t.topic_type === "lesson").map((t) => t.topic_id));
  const quizTopicIds = new Set(
    topics.filter((t) => t.topic_type === "checkpoint" || t.topic_type === "boss_challenge").map((t) => t.topic_id)
  );
  const completedTopicIds = new Set((progressRes.data ?? []).filter((p) => p.status === "completed").map((p) => p.topic_id));
  const progressByTopic = new Map((progressRes.data ?? []).map((p) => [p.topic_id, p]));

  const hasCompletedLesson = [...completedTopicIds].some((id) => lessonTopicIds.has(id));
  const hasPerfectQuiz = [...quizTopicIds].some((id) => progressByTopic.get(id)?.score === 100);

  const earnedSet = new Set((earnedRes.data ?? []).map((e) => e.achievement_slug));
  const slugs = (achievementsRes.data ?? []).map((a) => a.slug);

  const profileData = {
    xp: profile.xp ?? 0,
    streak_days: profile.streak_days ?? 0,
    rank: profile.rank ?? "novice",
    avatar_url: profile.avatar_url ?? null,
  };

  for (const slug of slugs) {
    const meets = await checkAchievementRequirement(
      supabase,
      userId,
      slug,
      profileData,
      earnedSet,
      hasCompletedLesson,
      hasPerfectQuiz
    );
    if (meets) {
      await grantAchievement(supabase, userId, slug);
      earnedSet.add(slug);
    }
  }

  return {};
}

export async function completeLesson(topicId: string, xpEarned: number, isRedo = false): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();

  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      topic_id: topicId,
      status: "completed",
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
      attempts: 1,
    },
    { onConflict: "user_id,topic_id" }
  );

  await markNudgesForTopicRead(supabase, userId, topicId);

  if (isRedo) {
    return {};
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: profile } = await supabase.from("user_profiles").select("xp, streak_days, last_activity_date").eq("id", userId).single();

  let newStreak = profile?.streak_days ?? 0;
  const last = profile?.last_activity_date;
  if (last) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (last === yesterdayStr) newStreak += 1;
    else if (last !== today) newStreak = 1;
  } else {
    newStreak = 1;
  }

  const firstActivityOfDay = last !== today;
  const dailyBonusXp = firstActivityOfDay ? FIRST_ACTIVITY_OF_DAY_BONUS_XP : 0;
  const newXp = (profile?.xp ?? 0) + xpEarned + dailyBonusXp;
  const level = getLevelFromXP(newXp);

  await supabase.from("user_profiles").update({
    xp: newXp,
    level,
    streak_days: newStreak,
    last_activity_date: today,
    updated_at: new Date().toISOString(),
  }).eq("id", userId);

  await supabase.from("xp_events").insert({
    user_id: userId,
    amount: xpEarned,
    reason: `Completed lesson ${topicId}`,
    topic_id: topicId,
  });
  if (dailyBonusXp > 0) {
    await supabase.from("xp_events").insert({
      user_id: userId,
      amount: dailyBonusXp,
      reason: "First activity of the day",
    });
  }

  const { data: topics } = await supabase.from("topics").select("topic_id, order_index").order("order_index");
  const currentOrder = topics?.find((t) => t.topic_id === topicId)?.order_index ?? -1;
  const nextTopic = topics?.find((t) => t.order_index === currentOrder + 1);
  if (nextTopic) {
    await supabase.from("user_progress").upsert(
      { user_id: userId, topic_id: nextTopic.topic_id, status: "available" },
      { onConflict: "user_id,topic_id" }
    );
  }

  const isFirstLesson = !(await supabase.from("xp_events").select("id").eq("user_id", userId).neq("topic_id", topicId).limit(1).single()).data;
  if (isFirstLesson) {
    await grantAchievement(supabase, userId, "first_lesson");
  }
  if (newStreak === 7) await grantAchievement(supabase, userId, "streak_7");
  if (newStreak === 30) await grantAchievement(supabase, userId, "streak_30");

  return {};
}

export async function completeQuiz(topicId: string, score: number, xpEarned: number, isRedo = false): Promise<{ error?: string; rankUp?: boolean; newRankSlug?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const { data: topic } = await supabase.from("topics").select("topic_type, level_number").eq("topic_id", topicId).single();
  const isBoss = topic?.topic_type === "boss_challenge";
  const isCheckpoint = topic?.topic_type === "checkpoint";
  const threshold = isCheckpoint ? 80 : isBoss ? 80 : 70;
  if (score < threshold) return { error: "Score too low to pass" };

  await supabase.from("user_progress").update({
    status: "completed",
    score,
    xp_earned: xpEarned,
    completed_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("topic_id", topicId);

  await markNudgesForTopicRead(supabase, userId, topicId);

  if (isRedo) return {};

  const today = new Date().toISOString().slice(0, 10);
  const { data: profile } = await supabase.from("user_profiles").select("xp, streak_days, last_activity_date, rank").eq("id", userId).single();

  let newStreak = profile?.streak_days ?? 0;
  const last = profile?.last_activity_date;
  if (last) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (last !== yesterday.toISOString().slice(0, 10) && last !== today) newStreak = 1;
    else if (last === yesterday.toISOString().slice(0, 10)) newStreak += 1;
  } else newStreak = 1;

  const firstActivityOfDay = last !== today;
  const dailyBonusXp = firstActivityOfDay ? FIRST_ACTIVITY_OF_DAY_BONUS_XP : 0;
  const newXp = (profile?.xp ?? 0) + xpEarned + dailyBonusXp;
  const level = getLevelFromXP(newXp);

  await supabase.from("user_profiles").update({
    xp: newXp,
    level,
    streak_days: newStreak,
    last_activity_date: today,
    updated_at: new Date().toISOString(),
  }).eq("id", userId);

  await supabase.from("xp_events").insert({
    user_id: userId,
    amount: xpEarned,
    reason: `Completed quiz ${topicId}`,
    topic_id: topicId,
  });
  if (dailyBonusXp > 0) {
    await supabase.from("xp_events").insert({
      user_id: userId,
      amount: dailyBonusXp,
      reason: "First activity of the day",
    });
  }

  let newRankSlug: string | undefined;
  if (isBoss && topic?.level_number) {
    const newRank = getRankForCurriculumLevel(topic.level_number);
    if (newRank.slug !== (profile?.rank ?? "novice")) {
      await supabase.from("user_profiles").update({ rank: newRank.slug }).eq("id", userId);
      newRankSlug = newRank.slug;
      const rankAchievementSlug = newRank.slug === "hero" ? "hero" : `rank_${newRank.slug}`;
      await grantAchievement(supabase, userId, rankAchievementSlug);
    }
  }
  if (score === 100) await grantAchievement(supabase, userId, "perfect_quiz");
  if (newStreak === 7) await grantAchievement(supabase, userId, "streak_7");
  if (newStreak === 30) await grantAchievement(supabase, userId, "streak_30");

  let nextTopic: string | null = null;
  if (topicId.includes("checkpoint")) {
    const [level, section] = topicId.replace(".checkpoint", "").split(".");
    const nextSection = Number(section) + 1;
    nextTopic = `${level}.${nextSection}.1`;
  }
  if (nextTopic) {
    await supabase.from("user_progress").upsert(
      { user_id: userId, topic_id: nextTopic, status: "available" },
      { onConflict: "user_id,topic_id" }
    );
  }

  return { rankUp: !!newRankSlug, newRankSlug };
}

/** Decrements hearts by 1 (floor 0). Applies regeneration (1 heart per 5 min) before decrementing. */
export async function decrementHeart(): Promise<{ error?: string; hearts?: number }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const { data: profile, error: fetchError } = await supabase
    .from("user_profiles")
    .select("hearts, last_hearts_at, max_hearts")
    .eq("id", userId)
    .single();

  if (fetchError || !profile) return { error: fetchError?.message ?? "Profile not found" };

  const maxHearts = profile.max_hearts ?? 5;
  const { hearts: afterRegen } = applyRegeneration(
    profile.hearts ?? 5,
    profile.last_hearts_at,
    maxHearts
  );
  const newHearts = Math.max(0, afterRegen - 1);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ hearts: newHearts, last_hearts_at: now, updated_at: now })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };
  return { hearts: newHearts };
}
