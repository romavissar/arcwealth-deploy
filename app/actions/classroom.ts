"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { canAccessTeacherDashboard } from "@/lib/roles";
import { getMyStudents, type StudentProgress } from "@/app/actions/teacher";
import { bucharestToISO, formatDateTimeInBucharest } from "@/lib/bucharest-time";
import { getLessonTitle } from "@/lib/curriculum";
import {
  sendClassroomAnnouncementEmail,
  sendClassroomAssignmentEmail,
} from "@/lib/resend";

/** True if current user can access the given teacher's classroom as owner or admin. */
async function canAccessClassroomAsTeacher(teacherUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  if (userId === teacherUserId) {
    const ok = await canAccessTeacherDashboard();
    return ok;
  }
  return isAdmin();
}

/** True if current user is a student in the given teacher's classroom. */
async function canAccessClassroomAsStudent(teacherUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("teacher_user_id", teacherUserId)
    .eq("student_user_id", userId)
    .single();
  return !!data;
}

export type ClassroomMessage = {
  id: string;
  content: string;
  createdAt: string;
};

export type ClassroomAssignment = {
  id: string;
  topicId: string;
  dueAt: string;
  title: string | null;
  createdAt: string;
};

export type AssignmentCompletionRow = {
  studentUserId: string;
  username: string;
  completed: boolean;
  completedAt: string | null;
};

export type ClassroomListItem = {
  teacherUserId: string;
  teacherUsername: string;
  studentCount: number;
};

export type ClassroomPeople = {
  teacher: { id: string; username: string; avatarUrl: string | null; rank: string; level: number };
  students: { id: string; username: string; avatarUrl: string | null; rank: string; level: number }[];
};

/** Get students for a classroom. Teacher or admin only. */
export async function getClassroomStudents(teacherUserId: string): Promise<{
  error?: string;
  students?: StudentProgress[];
}> {
  const ok = await canAccessClassroomAsTeacher(teacherUserId);
  if (!ok) return { error: "Forbidden" };
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  const effectiveTeacherId = userId === teacherUserId ? userId : teacherUserId;
  const res = await getMyStudents(effectiveTeacherId);
  return res;
}

/** Get messages for a classroom. Teacher, admin, or student in that class. */
export async function getClassroomMessages(teacherUserId: string): Promise<{
  error?: string;
  messages?: ClassroomMessage[];
}> {
  const asTeacher = await canAccessClassroomAsTeacher(teacherUserId);
  const asStudent = await canAccessClassroomAsStudent(teacherUserId);
  if (!asTeacher && !asStudent) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("classroom_messages")
    .select("id, content, created_at")
    .eq("teacher_user_id", teacherUserId)
    .order("created_at", { ascending: false });
  if (error) return { error: error.message };
  return {
    messages: (data ?? []).map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.created_at,
    })),
  };
}

/** Post a message. Teacher or admin only. */
export async function postClassroomMessage(
  teacherUserId: string,
  content: string
): Promise<{ error?: string }> {
  const ok = await canAccessClassroomAsTeacher(teacherUserId);
  if (!ok) return { error: "Forbidden" };
  const trimmed = content?.trim();
  if (!trimmed) return { error: "Message is required" };
  const supabase = createServiceClient();
  const { error } = await supabase.from("classroom_messages").insert({
    teacher_user_id: teacherUserId,
    content: trimmed,
  });
  if (error) return { error: error.message };

  // Notify students by email (best-effort; don't fail the action)
  const [{ data: teacherProfile }, studentsRes] = await Promise.all([
    supabase.from("user_profiles").select("username").eq("id", teacherUserId).single(),
    getMyStudents(teacherUserId),
  ]);
  const teacherName = teacherProfile?.username?.trim() || "Your teacher";
  const students = studentsRes.students ?? [];
  const withEmail = students.filter((s) => s.email?.trim());
  if (withEmail.length > 0) {
    Promise.allSettled(
      withEmail.map((s) =>
        sendClassroomAnnouncementEmail(s.email!, teacherName, trimmed)
      )
    ).then((results) => {
      const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && r.value?.error));
      if (failed.length > 0 && process.env.NODE_ENV === "development") {
        console.warn("[Classroom] Some announcement emails failed:", failed.length);
      }
    });
  }
  return {};
}

/** Get assignments for a classroom. Teacher, admin, or student in that class. */
export async function getClassroomAssignments(teacherUserId: string): Promise<{
  error?: string;
  assignments?: ClassroomAssignment[];
}> {
  const asTeacher = await canAccessClassroomAsTeacher(teacherUserId);
  const asStudent = await canAccessClassroomAsStudent(teacherUserId);
  if (!asTeacher && !asStudent) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("classroom_assignments")
    .select("id, topic_id, due_at, title, created_at")
    .eq("teacher_user_id", teacherUserId)
    .order("due_at", { ascending: true });
  if (error) return { error: error.message };
  return {
    assignments: (data ?? []).map((r) => ({
      id: r.id,
      topicId: r.topic_id,
      dueAt: r.due_at,
      title: r.title ?? null,
      createdAt: r.created_at,
    })),
  };
}

/** Create an assignment. Teacher or admin only. dueDate YYYY-MM-DD, dueTime HH:mm (Europe/Bucharest). */
export async function createClassroomAssignment(
  teacherUserId: string,
  topicId: string,
  dueDate: string,
  dueTime: string,
  title?: string
): Promise<{ error?: string }> {
  const ok = await canAccessClassroomAsTeacher(teacherUserId);
  if (!ok) return { error: "Forbidden" };
  if (!topicId?.trim()) return { error: "Topic is required" };
  if (!dueDate?.trim()) return { error: "Due date is required" };
  const dueAt = bucharestToISO(dueDate.trim(), dueTime?.trim() || "23:59");
  const supabase = createServiceClient();
  const { error } = await supabase.from("classroom_assignments").insert({
    teacher_user_id: teacherUserId,
    topic_id: topicId.trim(),
    due_at: dueAt,
    title: title?.trim() || null,
  });
  if (error) return { error: error.message };

  // Notify students by email (best-effort; don't fail the action)
  const assignmentLabel = (title?.trim() || getLessonTitle(topicId.trim()));
  const dueDisplay = formatDateTimeInBucharest(dueAt);
  const [{ data: teacherProfile }, studentsRes] = await Promise.all([
    supabase.from("user_profiles").select("username").eq("id", teacherUserId).single(),
    getMyStudents(teacherUserId),
  ]);
  const teacherName = teacherProfile?.username?.trim() || "Your teacher";
  const students = studentsRes.students ?? [];
  const withEmail = students.filter((s) => s.email?.trim());
  if (withEmail.length > 0) {
    Promise.allSettled(
      withEmail.map((s) =>
        sendClassroomAssignmentEmail(s.email!, teacherName, assignmentLabel, dueDisplay)
      )
    ).then((results) => {
      const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && r.value?.error));
      if (failed.length > 0 && process.env.NODE_ENV === "development") {
        console.warn("[Classroom] Some assignment emails failed:", failed.length);
      }
    });
  }
  return {};
}

/** Get completion for one assignment (after due date). Teacher or admin only. */
export async function getAssignmentCompletion(assignmentId: string): Promise<{
  error?: string;
  assignment?: { topicId: string; dueAt: string; title: string | null };
  completion?: AssignmentCompletionRow[];
}> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  const supabase = createServiceClient();
  const { data: assignment, error: assignErr } = await supabase
    .from("classroom_assignments")
    .select("id, teacher_user_id, topic_id, due_at, title")
    .eq("id", assignmentId)
    .single();
  if (assignErr || !assignment) return { error: "Assignment not found" };
  const ok = await canAccessClassroomAsTeacher(assignment.teacher_user_id);
  if (!ok) return { error: "Forbidden" };

  const { data: links } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("teacher_user_id", assignment.teacher_user_id);
  const studentIds = (links ?? []).map((l) => l.student_user_id);
  if (studentIds.length === 0) {
    return {
      assignment: {
        topicId: assignment.topic_id,
        dueAt: assignment.due_at,
        title: assignment.title ?? null,
      },
      completion: [],
    };
  }

  const dueEndIso = assignment.due_at;

  const { data: progress } = await supabase
    .from("user_progress")
    .select("user_id, completed_at")
    .eq("topic_id", assignment.topic_id)
    .eq("status", "completed")
    .in("user_id", studentIds);
  const completedByUser = new Map(
    (progress ?? []).map((p) => [p.user_id, p.completed_at ?? null])
  );

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username")
    .in("id", studentIds);
  const usernameById = new Map((profiles ?? []).map((p) => [p.id, p.username ?? "?"]));

  const completion: AssignmentCompletionRow[] = studentIds.map((id) => {
    const completedAt = completedByUser.get(id) ?? null;
    const completed = completedAt ? completedAt <= dueEndIso : false;
    return {
      studentUserId: id,
      username: usernameById.get(id) ?? "?",
      completed,
      completedAt: completed ? completedAt : null,
    };
  });
  completion.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));

  return {
    assignment: {
      topicId: assignment.topic_id,
      dueAt: assignment.due_at,
      title: assignment.title ?? null,
    },
    completion,
  };
}

/** Get current user's teacher id if they are a student. */
export async function getMyClassroomTeacherId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("student_teacher")
    .select("teacher_user_id")
    .eq("student_user_id", userId)
    .single();
  return data?.teacher_user_id ?? null;
}

/** Get people in classroom (teacher + students). For student view. */
export async function getClassroomPeople(teacherUserId: string): Promise<{
  error?: string;
  people?: ClassroomPeople;
}> {
  const ok = await canAccessClassroomAsStudent(teacherUserId);
  if (!ok) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data: teacherProfile } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url, rank, level")
    .eq("id", teacherUserId)
    .single();
  const { data: links } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("teacher_user_id", teacherUserId);
  const studentIds = (links ?? []).map((l) => l.student_user_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url, rank, level")
    .in("id", studentIds);
  return {
    people: {
      teacher: {
        id: teacherUserId,
        username: teacherProfile?.username ?? "Teacher",
        avatarUrl: teacherProfile?.avatar_url ?? null,
        rank: teacherProfile?.rank ?? "novice",
        level: teacherProfile?.level ?? 1,
      },
      students: (profiles ?? []).map((p) => ({
        id: p.id,
        username: p.username ?? "?",
        avatarUrl: p.avatar_url ?? null,
        rank: p.rank ?? "novice",
        level: p.level ?? 1,
      })),
    },
  };
}

/** Get assignment completion status for current user (student). */
export async function getMyAssignmentStatus(
  teacherUserId: string
): Promise<{ assignmentId: string; topicId: string; dueAt: string; completed: boolean }[]> {
  const ok = await canAccessClassroomAsStudent(teacherUserId);
  if (!ok) return [];
  const { userId } = await auth();
  if (!userId) return [];
  const res = await getClassroomAssignments(teacherUserId);
  if (res.error || !res.assignments?.length) return [];
  const supabase = createServiceClient();
  const topicIds = res.assignments.map((a) => a.topicId);
  const { data: progress } = await supabase
    .from("user_progress")
    .select("topic_id, status")
    .eq("user_id", userId)
    .in("topic_id", topicIds);
  const completedTopics = new Set(
    (progress ?? []).filter((p) => p.status === "completed").map((p) => p.topic_id)
  );
  return res.assignments.map((a) => ({
    assignmentId: a.id,
    topicId: a.topicId,
    dueAt: a.dueAt,
    completed: completedTopics.has(a.topicId),
  }));
}

/** All classrooms (admin only). */
export async function getAllClassrooms(): Promise<{
  error?: string;
  classrooms?: ClassroomListItem[];
}> {
  const ok = await isAdmin();
  if (!ok) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data: links } = await supabase
    .from("student_teacher")
    .select("teacher_user_id");
  const teacherIds = [...new Set((links ?? []).map((l) => l.teacher_user_id))];
  if (teacherIds.length === 0) return { classrooms: [] };
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username")
    .in("id", teacherIds);
  const countByTeacher = new Map<string, number>();
  for (const l of links ?? []) {
    countByTeacher.set(l.teacher_user_id, (countByTeacher.get(l.teacher_user_id) ?? 0) + 1);
  }
  const classrooms: ClassroomListItem[] = (profiles ?? []).map((p) => ({
    teacherUserId: p.id,
    teacherUsername: p.username ?? "Teacher",
    studentCount: countByTeacher.get(p.id) ?? 0,
  }));
  classrooms.sort((a, b) => a.teacherUsername.localeCompare(b.teacherUsername));
  return { classrooms };
}
