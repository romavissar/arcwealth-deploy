"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { canAccessTeacherDashboard } from "@/lib/roles";
import { LESSON_TITLES } from "@/lib/curriculum";
import { sendNudgeEmail, sendCongratulationsEmail } from "@/lib/resend";

export type StudentProgress = {
  id: string;
  username: string;
  email: string | null;
  xp: number;
  rank: string;
  level: number;
  streak_days: number;
  last_activity_date: string | null;
  completedLevels: number[];
  completedTopicCount: number;
  achievements: { slug: string; title: string; icon: string }[];
  /** Next lesson topic_id (for nudge). Null if no next (e.g. finished curriculum). */
  nextTopicId: string | null;
};

export async function getMyStudents(): Promise<
  { error?: string; students?: StudentProgress[] }
> {
  try {
  const ok = await canAccessTeacherDashboard();
  if (!ok) return { error: "Forbidden" };
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  const supabase = createServiceClient();
  const { data: links, error: linksError } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("teacher_user_id", userId);
  if (linksError) return { error: linksError.message };
  const studentIds = (links ?? []).map((l) => l.student_user_id);
  if (studentIds.length === 0) return { students: [] };
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, username, email, xp, rank, level, streak_days, last_activity_date")
    .in("id", studentIds);
  if (profilesError) return { error: profilesError.message };
  const { data: progress } = await supabase
    .from("user_progress")
    .select("user_id, topic_id")
    .eq("status", "completed")
    .in("user_id", studentIds);
  const { data: topicsRows } = await supabase.from("topics").select("topic_id, level_number, order_index").order("order_index");
  const levelByTopic = new Map((topicsRows ?? []).map((t) => [t.topic_id, t.level_number]));
  const orderByTopic = new Map((topicsRows ?? []).map((t) => [t.topic_id, t.order_index ?? 0]));
  const topicByOrder = new Map((topicsRows ?? []).map((t) => [t.order_index ?? 0, t.topic_id]));
  const maxOrder = topicsRows?.length ? Math.max(...(topicsRows.map((t) => t.order_index ?? 0))) : -1;
  const completedByUser = new Map<string, { levels: Set<number>; count: number; topicIds: string[] }>();
  for (const p of progress ?? []) {
    const level = levelByTopic.get(p.topic_id);
    if (!completedByUser.has(p.user_id)) {
      completedByUser.set(p.user_id, { levels: new Set(), count: 0, topicIds: [] });
    }
    const entry = completedByUser.get(p.user_id)!;
    entry.count++;
    entry.topicIds.push(p.topic_id);
    if (level != null) entry.levels.add(level);
  }
  function getNextTopicIdForUser(userId: string): string | null {
    const comp = completedByUser.get(userId);
    if (!comp?.topicIds.length) return topicByOrder.get(0) ?? "1.1.1";
    const lastOrder = Math.max(...comp.topicIds.map((tid) => orderByTopic.get(tid) ?? -1));
    const nextOrder = lastOrder + 1;
    if (nextOrder > maxOrder) return null;
    return topicByOrder.get(nextOrder) ?? null;
  }
  const { data: userAch } = await supabase
    .from("user_achievements")
    .select("user_id, achievement_slug")
    .in("user_id", studentIds);
  const achSlugs = [...new Set((userAch ?? []).map((a) => a.achievement_slug))];
  const { data: achievements } = await supabase
    .from("achievements")
    .select("slug, title, icon")
    .in("slug", achSlugs);
  const achMap = new Map((achievements ?? []).map((a) => [a.slug, { title: a.title, icon: a.icon }]));
  const achByUser = new Map<string, { slug: string; title: string; icon: string }[]>();
  for (const ua of userAch ?? []) {
    const a = achMap.get(ua.achievement_slug);
    if (!a) continue;
    if (!achByUser.has(ua.user_id)) achByUser.set(ua.user_id, []);
    achByUser.get(ua.user_id)!.push({ slug: ua.achievement_slug, title: a.title, icon: a.icon });
  }
  const students: StudentProgress[] = (profiles ?? []).map((p) => {
    const comp = completedByUser.get(p.id) ?? { levels: new Set<number>(), count: 0, topicIds: [] };
    return {
      id: p.id,
      username: p.username,
      email: p.email ?? null,
      xp: p.xp ?? 0,
      rank: p.rank ?? "novice",
      level: p.level ?? 1,
      streak_days: p.streak_days ?? 0,
      last_activity_date: p.last_activity_date ?? null,
      completedLevels: [...comp.levels].sort((a, b) => a - b),
      completedTopicCount: comp.count,
      achievements: achByUser.get(p.id) ?? [],
      nextTopicId: getNextTopicIdForUser(p.id),
    };
  });
  students.sort((a, b) => (b.last_activity_date ?? "").localeCompare(a.last_activity_date ?? ""));
  return { students };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to load students" };
  }
}

/** Teacher nudges a student to do the next lesson. Only for linked students. Sends in-app notification + email. */
export async function nudgeStudent(studentUserId: string): Promise<{ error?: string }> {
  try {
    const ok = await canAccessTeacherDashboard();
    if (!ok) return { error: "Forbidden" };
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };
    const supabase = createServiceClient();
    const { data: link } = await supabase
      .from("student_teacher")
      .select("student_user_id")
      .eq("teacher_user_id", userId)
      .eq("student_user_id", studentUserId)
      .single();
    if (!link) return { error: "Student is not assigned to you" };
    const nextTopicId = await getNextTopicIdForStudent(supabase, studentUserId);
    const lessonLabel = nextTopicId
      ? `Lesson ${nextTopicId} – ${LESSON_TITLES[nextTopicId] ?? nextTopicId}`
      : "your next lesson";

    // 1) In-app notification (shows in bell / dashboard)
    const { error: insertErr } = await supabase.from("teacher_nudges").insert({
      teacher_user_id: userId,
      student_user_id: studentUserId,
      next_topic_id: nextTopicId,
    });
    if (insertErr) return { error: insertErr.message };

    // 2) Email
    const [{ data: studentProfile }, { data: teacherProfile }] = await Promise.all([
      supabase.from("user_profiles").select("email").eq("id", studentUserId).single(),
      supabase.from("user_profiles").select("username").eq("id", userId).single(),
    ]);
    const teacherName = teacherProfile?.username ?? "Your teacher";
    const studentEmail = studentProfile?.email?.trim();
    if (!studentEmail) {
      return { error: "Nudge saved, but no email was sent: this student has no email on file. Ask them to sign in with an email (Profile/Settings) so it syncs." };
    }
    const emailResult = await sendNudgeEmail(studentEmail, teacherName, lessonLabel);
    if (emailResult.error) return { error: `Nudge saved, but email failed: ${emailResult.error}` };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to send nudge" };
  }
}

/** Teacher congratulates a student. Only for linked students. Sends in-app notification + email. */
export async function congratulateStudent(studentUserId: string): Promise<{ error?: string }> {
  try {
    const ok = await canAccessTeacherDashboard();
    if (!ok) return { error: "Forbidden" };
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };
    const supabase = createServiceClient();
    const { data: link } = await supabase
      .from("student_teacher")
      .select("student_user_id")
      .eq("teacher_user_id", userId)
      .eq("student_user_id", studentUserId)
      .single();
    if (!link) return { error: "Student is not assigned to you" };

    // 1) In-app notification (shows in bell / dashboard)
    const { error: insertErr } = await supabase.from("teacher_congratulations").insert({
      teacher_user_id: userId,
      student_user_id: studentUserId,
    });
    if (insertErr) return { error: insertErr.message };

    // 2) Email
    const [{ data: studentProfile }, { data: teacherProfile }] = await Promise.all([
      supabase.from("user_profiles").select("email").eq("id", studentUserId).single(),
      supabase.from("user_profiles").select("username").eq("id", userId).single(),
    ]);
    const teacherName = teacherProfile?.username ?? "Your teacher";
    const studentEmail = studentProfile?.email?.trim();
    if (!studentEmail) {
      return { error: "Congratulations saved, but no email was sent: this student has no email on file. Ask them to sign in with an email (Profile/Settings) so it syncs." };
    }
    const emailResult = await sendCongratulationsEmail(studentEmail, teacherName);
    if (emailResult.error) return { error: `Congratulations saved, but email failed: ${emailResult.error}` };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to send congratulations" };
  }
}

async function getNextTopicIdForStudent(supabase: ReturnType<typeof createServiceClient>, studentUserId: string): Promise<string | null> {
  const { data: topicsRows } = await supabase.from("topics").select("topic_id, order_index").order("order_index");
  const orderByTopic = new Map((topicsRows ?? []).map((t) => [t.topic_id, t.order_index ?? 0]));
  const topicByOrder = new Map((topicsRows ?? []).map((t) => [t.order_index ?? 0, t.topic_id]));
  const maxOrder = topicsRows?.length ? Math.max(...(topicsRows.map((t) => t.order_index ?? 0))) : -1;
  const { data: completed } = await supabase
    .from("user_progress")
    .select("topic_id")
    .eq("user_id", studentUserId)
    .eq("status", "completed");
  const topicIds = (completed ?? []).map((r) => r.topic_id);
  if (!topicIds.length) return topicByOrder.get(0) ?? "1.1.1";
  const lastOrder = Math.max(...topicIds.map((tid) => orderByTopic.get(tid) ?? -1));
  const nextOrder = lastOrder + 1;
  if (nextOrder > maxOrder) return null;
  return topicByOrder.get(nextOrder) ?? null;
}
