"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { LESSON_TITLES } from "@/lib/curriculum";

export type NudgeItem = {
  id: string;
  teacherUsername: string;
  nextTopicId: string | null;
  lessonLabel: string;
  createdAt: string;
  readAt: string | null;
};

export type CongratsItem = {
  id: string;
  teacherUsername: string;
  createdAt: string;
  readAt: string | null;
};

export type NotificationItem =
  | { type: "nudge"; id: string; teacherUsername: string; nextTopicId: string | null; lessonLabel: string; createdAt: string; readAt: string | null }
  | { type: "congrats"; id: string; teacherUsername: string; createdAt: string; readAt: string | null };

/** Latest unread nudge for the current user (student). Used for dashboard popup; null once they complete the nudged lesson. */
export async function getLatestNudge(): Promise<{
  teacherUsername: string;
  nextTopicId: string | null;
  createdAt: string;
} | null> {
  const nudges = await getMyNudges({ onlyUnread: true });
  if (nudges.length === 0) return null;
  const n = nudges[0];
  return {
    teacherUsername: n.teacherUsername,
    nextTopicId: n.nextTopicId,
    createdAt: n.createdAt,
  };
}

/** List of nudges for the current user (student). Last 7 days, most recent first. onlyUnread: true = only nudges not yet read (e.g. for dashboard popup). */
export async function getMyNudges(opts?: { onlyUnread?: boolean }): Promise<NudgeItem[]> {
  const { userId } = await auth();
  if (!userId) return [];
  const supabase = createServiceClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  let query = supabase
    .from("teacher_nudges")
    .select("id, teacher_user_id, next_topic_id, created_at, read_at")
    .eq("student_user_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(20);
  if (opts?.onlyUnread) {
    query = query.is("read_at", null);
  }
  const { data: rows } = await query;
  if (!rows?.length) return [];
  const teacherIds = [...new Set(rows.map((r) => r.teacher_user_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username")
    .in("id", teacherIds);
  const usernameById = new Map((profiles ?? []).map((p) => [p.id, p.username ?? "Your teacher"]));
  return rows.map((r) => ({
    id: r.id,
    teacherUsername: usernameById.get(r.teacher_user_id) ?? "Your teacher",
    nextTopicId: r.next_topic_id ?? null,
    lessonLabel: r.next_topic_id
      ? `Lesson ${r.next_topic_id} – ${LESSON_TITLES[r.next_topic_id] ?? r.next_topic_id}`
      : "your next lesson",
    createdAt: r.created_at,
    readAt: r.read_at ?? null,
  }));
}

/** List of congratulations for the current user (student). Last 7 days, most recent first. */
export async function getMyCongratulations(): Promise<CongratsItem[]> {
  const { userId } = await auth();
  if (!userId) return [];
  const supabase = createServiceClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: rows } = await supabase
    .from("teacher_congratulations")
    .select("id, teacher_user_id, created_at, read_at")
    .eq("student_user_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(20);
  if (!rows?.length) return [];
  const teacherIds = [...new Set(rows.map((r) => r.teacher_user_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username")
    .in("id", teacherIds);
  const usernameById = new Map((profiles ?? []).map((p) => [p.id, p.username ?? "Your teacher"]));
  return rows.map((r) => ({
    id: r.id,
    teacherUsername: usernameById.get(r.teacher_user_id) ?? "Your teacher",
    createdAt: r.created_at,
    readAt: r.read_at ?? null,
  }));
}

/** Mark a nudge or congratulations as done (read). Returns error if not found or not the current user's. */
export async function markNotificationDone(
  type: "nudge" | "congrats",
  id: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  const supabase = createServiceClient();
  const table = type === "nudge" ? "teacher_nudges" : "teacher_congratulations";
  const { error } = await supabase
    .from(table)
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("student_user_id", userId);
  if (error) return { error: error.message };
  return {};
}

/** Unified list of nudges and congratulations for the current user, sorted by date (newest first). */
export async function getMyNotifications(): Promise<NotificationItem[]> {
  const [nudges, congrats] = await Promise.all([getMyNudges(), getMyCongratulations()]);
  const items: NotificationItem[] = [
    ...nudges.map((n) => ({ type: "nudge" as const, ...n })),
    ...congrats.map((c) => ({ type: "congrats" as const, ...c })),
  ];
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, 20);
}

