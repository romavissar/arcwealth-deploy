"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getLevelFromXP } from "@/lib/xp";
import { getRankForCurriculumLevel } from "@/lib/ranks";
import { applyRegeneration } from "@/lib/hearts";

export async function completeLesson(topicId: string, xpEarned: number, isRedo = false): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();

  await supabase.from("user_progress").update({
    status: "completed",
    xp_earned: xpEarned,
    completed_at: new Date().toISOString(),
    attempts: 1,
  }).eq("user_id", userId).eq("topic_id", topicId);

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

  const newXp = (profile?.xp ?? 0) + xpEarned;
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
    void supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_slug: "first_lesson",
    }).then(() => {}, () => {});
  }

  return {};
}

export async function completeQuiz(topicId: string, score: number, xpEarned: number, isRedo = false): Promise<{ error?: string; rankUp?: boolean; newRankSlug?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const { data: topic } = await supabase.from("topics").select("topic_type, level_number").eq("topic_id", topicId).single();
  const isBoss = topic?.topic_type === "boss_challenge";
  const threshold = isBoss ? 80 : 70;
  if (score < threshold) return { error: "Score too low to pass" };

  await supabase.from("user_progress").update({
    status: "completed",
    score,
    xp_earned: xpEarned,
    completed_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("topic_id", topicId);

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

  const newXp = (profile?.xp ?? 0) + xpEarned;
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

  let newRankSlug: string | undefined;
  if (isBoss && topic?.level_number) {
    const newRank = getRankForCurriculumLevel(topic.level_number);
    if (newRank.slug !== (profile?.rank ?? "novice")) {
      await supabase.from("user_profiles").update({ rank: newRank.slug }).eq("id", userId);
      newRankSlug = newRank.slug;
    }
  }

  const nextTopic = topicId.includes("checkpoint")
    ? topicId.replace(".checkpoint", "").split(".").slice(0, 2).join(".") + ".boss"
    : null;
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
