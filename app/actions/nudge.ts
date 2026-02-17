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
  | { type: "congrats"; id: string; teacherUsername: string; createdAt: string; readAt: string | null }
  | { type: "friend_request"; id: string; fromUserId: string; fromUsername: string; createdAt: string; readAt?: string | null }
  | { type: "friend_accepted"; id: string; friendUserId: string; friendUsername: string; createdAt: string; readAt?: string | null }
  | { type: "assignment"; id: string; teacherUsername: string; title: string; topicId: string; dueAt: string; createdAt: string; readAt?: string | null }
  | { type: "announcement"; id: string; teacherUsername: string; contentPreview: string; createdAt: string; readAt?: string | null };

export type NotificationType = NotificationItem["type"];

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
  await supabase.from("user_notification_state").upsert(
    { user_id: userId, notification_type: type, ref_id: id, read_at: new Date().toISOString(), dismissed_at: null },
    { onConflict: "user_id,notification_type,ref_id" }
  );
  return {};
}

/** Mark any notification as read (stores in user_notification_state). For nudge/congrats also updates the source table. */
export async function markNotificationAsRead(
  type: NotificationType,
  refId: string
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  if (type === "nudge" || type === "congrats") {
    const table = type === "nudge" ? "teacher_nudges" : "teacher_congratulations";
    await supabase.from(table).update({ read_at: now }).eq("id", refId).eq("student_user_id", userId);
  }
  await supabase.from("user_notification_state").upsert(
    { user_id: userId, notification_type: type, ref_id: refId, read_at: now, dismissed_at: null },
    { onConflict: "user_id,notification_type,ref_id" }
  );
  return {};
}

/** Dismiss (hide) a notification. Only affects display; read_at is set if not already. */
export async function dismissNotification(type: NotificationType, refId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  await supabase.from("user_notification_state").upsert(
    { user_id: userId, notification_type: type, ref_id: refId, read_at: now, dismissed_at: now },
    { onConflict: "user_id,notification_type,ref_id" }
  );
  return {};
}

/** Friend requests (incoming pending) for notification list. */
async function getMyFriendRequestNotifications(): Promise<NotificationItem[]> {
  const { userId } = await auth();
  if (!userId) return [];
  const supabase = createServiceClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: rows } = await supabase
    .from("friend_requests")
    .select("id, from_user_id, created_at")
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);
  if (!rows?.length) return [];
  const ids = [...new Set(rows.map((r) => r.from_user_id))];
  const { data: profiles } = await supabase.from("user_profiles").select("id, username").in("id", ids);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username ?? "Someone"]));
  return rows.map((r) => ({
    type: "friend_request" as const,
    id: r.id,
    fromUserId: r.from_user_id,
    fromUsername: nameById.get(r.from_user_id) ?? "Someone",
    createdAt: r.created_at,
  }));
}

/** Recent friendships (accepted in last 7 days) for "X accepted your request". */
async function getMyFriendAcceptedNotifications(): Promise<NotificationItem[]> {
  const { userId } = await auth();
  if (!userId) return [];
  const supabase = createServiceClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: rows } = await supabase
    .from("friends")
    .select("user_id_1, user_id_2, created_at")
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);
  if (!rows?.length) return [];
  const otherIds = rows.map((r) => (r.user_id_1 === userId ? r.user_id_2 : r.user_id_1));
  const { data: profiles } = await supabase.from("user_profiles").select("id, username").in("id", otherIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username ?? "Someone"]));
  return rows.map((r) => {
    const otherId = r.user_id_1 === userId ? r.user_id_2 : r.user_id_1;
    return {
      type: "friend_accepted" as const,
      id: `${r.user_id_1}-${r.user_id_2}-${r.created_at}`,
      friendUserId: otherId,
      friendUsername: nameById.get(otherId) ?? "Someone",
      createdAt: r.created_at,
    };
  });
}

/** Recent classroom assignments (from my teacher) for notification list. */
async function getMyAssignmentNotifications(): Promise<NotificationItem[]> {
  const { userId } = await auth();
  if (!userId) return [];
  const supabase = createServiceClient();
  const { data: link } = await supabase
    .from("student_teacher")
    .select("teacher_user_id")
    .eq("student_user_id", userId)
    .maybeSingle();
  if (!link) return [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: rows } = await supabase
    .from("classroom_assignments")
    .select("id, teacher_user_id, topic_id, due_at, title, created_at")
    .eq("teacher_user_id", link.teacher_user_id)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);
  if (!rows?.length) return [];
  const { data: teacher } = await supabase
    .from("user_profiles")
    .select("username")
    .eq("id", link.teacher_user_id)
    .single();
  const teacherName = teacher?.username ?? "Your teacher";
  const { getLessonTitle } = await import("@/lib/curriculum");
  return rows.map((r) => ({
    type: "assignment" as const,
    id: r.id,
    teacherUsername: teacherName,
    title: r.title?.trim() || getLessonTitle(r.topic_id),
    topicId: r.topic_id,
    dueAt: r.due_at,
    createdAt: r.created_at,
  }));
}

/** Recent classroom announcements (from my teacher) for notification list. */
async function getMyAnnouncementNotifications(): Promise<NotificationItem[]> {
  const { userId } = await auth();
  if (!userId) return [];
  const supabase = createServiceClient();
  const { data: link } = await supabase
    .from("student_teacher")
    .select("teacher_user_id")
    .eq("student_user_id", userId)
    .maybeSingle();
  if (!link) return [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: rows } = await supabase
    .from("classroom_messages")
    .select("id, teacher_user_id, content, created_at")
    .eq("teacher_user_id", link.teacher_user_id)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(10);
  if (!rows?.length) return [];
  const { data: teacher } = await supabase
    .from("user_profiles")
    .select("username")
    .eq("id", link.teacher_user_id)
    .single();
  const teacherName = teacher?.username ?? "Your teacher";
  return rows.map((r) => ({
    type: "announcement" as const,
    id: r.id,
    teacherUsername: teacherName,
    contentPreview: (r.content ?? "").slice(0, 80) + ((r.content ?? "").length > 80 ? "…" : ""),
    createdAt: r.created_at,
  }));
}

/** Unified list of nudges and congratulations for the current user, sorted by date (newest first). */
export async function getMyNotifications(): Promise<NotificationItem[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const [nudges, congrats, friendReqs, friendAccepted, assignments, announcements] = await Promise.all([
    getMyNudges(),
    getMyCongratulations(),
    getMyFriendRequestNotifications(),
    getMyFriendAcceptedNotifications(),
    getMyAssignmentNotifications(),
    getMyAnnouncementNotifications(),
  ]);
  let items: NotificationItem[] = [
    ...nudges.map((n) => ({ type: "nudge" as const, ...n })),
    ...congrats.map((c) => ({ type: "congrats" as const, ...c })),
    ...friendReqs,
    ...friendAccepted,
    ...assignments,
    ...announcements,
  ];
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  items = items.slice(0, 30);

  if (items.length === 0) return [];
  const supabase = createServiceClient();
  const { data: stateRows } = await supabase
    .from("user_notification_state")
    .select("notification_type, ref_id, read_at, dismissed_at")
    .eq("user_id", userId);
  const stateByKey = new Map(
    (stateRows ?? []).map((r) => [`${r.notification_type}:${r.ref_id}`, { read_at: r.read_at, dismissed_at: r.dismissed_at }])
  );

  const filtered: NotificationItem[] = [];
  for (const it of items) {
    const key = `${it.type}:${it.id}`;
    const state = stateByKey.get(key);
    if (state?.dismissed_at) continue;
    const readAt = state?.read_at ?? ("readAt" in it && it.readAt ? it.readAt : null);
    filtered.push({ ...it, readAt: readAt ?? null } as NotificationItem);
  }
  return filtered;
}

