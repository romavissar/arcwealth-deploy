"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

export async function getAdminConfig(): Promise<
  { error?: string; allowedStudentEmailEndings?: string[] } | void
> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("admin_config")
    .select("allowed_student_email_endings")
    .eq("id", 1)
    .single();
  if (error) return { error: error.message };
  const endings = (data?.allowed_student_email_endings as string[] | null) ?? [];
  return { allowedStudentEmailEndings: endings };
}

export async function setAllowedStudentEmailEndings(
  endings: string[]
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const normalized = endings.map((e) => e.trim().toLowerCase()).filter(Boolean);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("admin_config")
    .update({
      allowed_student_email_endings: normalized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  return error ? { error: error.message } : {};
}

/** Teachers are stored in teacher_list (persistent); we join to user_profiles for name/email. */
export async function getTeachers(): Promise<
  { error?: string; teachers?: { id: string; username: string; email: string | null }[] } | void
> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data: list, error: listErr } = await supabase
    .from("teacher_list")
    .select("user_id");
  if (listErr) return { error: listErr.message };
  if (!list?.length) return { teachers: [] };
  const ids = list.map((r) => r.user_id);
  const { data: profiles, error: profErr } = await supabase
    .from("user_profiles")
    .select("id, username, email")
    .in("id", ids);
  if (profErr) return { error: profErr.message };
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const teachers = ids
    .map((id) => byId.get(id))
    .filter(Boolean) as { id: string; username: string; email: string | null }[];
  teachers.sort((a, b) => (a.username ?? "").localeCompare(b.username ?? ""));
  return { teachers };
}

export async function addTeacherByEmail(email: string): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { error: "Email required" };
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();
  if (!profile) return { error: "No user found with that email. They must sign in once first." };
  const { error: insertErr } = await supabase.from("teacher_list").insert({ user_id: profile.id });
  if (insertErr && insertErr.code !== "23505") return { error: insertErr.message }; // 23505 = already in list
  const { error } = await supabase
    .from("user_profiles")
    .update({ role: "teacher", updated_at: new Date().toISOString() })
    .eq("id", profile.id);
  return error ? { error: error.message } : {};
}

export async function removeTeacher(teacherUserId: string): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const supabase = createServiceClient();
  await supabase.from("student_teacher").delete().eq("teacher_user_id", teacherUserId);
  await supabase.from("teacher_list").delete().eq("user_id", teacherUserId);
  const { error } = await supabase
    .from("user_profiles")
    .update({ role: "user", updated_at: new Date().toISOString() })
    .eq("id", teacherUserId);
  return error ? { error: error.message } : {};
}

export async function getStudentsWithTeachers(): Promise<
  {
    error?: string;
    students?: {
      id: string;
      username: string;
      email: string | null;
      xp: number;
      rank: string;
      level: number;
      streak_days: number;
      last_activity_date: string | null;
      teacher_id: string | null;
      teacher_username: string | null;
    }[];
  } | void
> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username, email, xp, rank, level, streak_days, last_activity_date")
    .in("role", ["student", "user"])
    .order("username");
  const { data: links } = await supabase.from("student_teacher").select("student_user_id, teacher_user_id");
  const teacherIds = new Set((links ?? []).map((l) => l.teacher_user_id));
  const { data: teacherProfiles } = await supabase
    .from("user_profiles")
    .select("id, username")
    .in("id", [...teacherIds]);
  const teacherMap = new Map((teacherProfiles ?? []).map((t) => [t.id, t.username]));
  const linkMap = new Map((links ?? []).map((l) => [l.student_user_id, l.teacher_user_id]));
  const students = (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username,
    email: p.email ?? null,
    xp: p.xp ?? 0,
    rank: p.rank ?? "novice",
    level: p.level ?? 1,
    streak_days: p.streak_days ?? 0,
    last_activity_date: p.last_activity_date ?? null,
    teacher_id: linkMap.get(p.id) ?? null,
    teacher_username: linkMap.get(p.id) ? teacherMap.get(linkMap.get(p.id)!) ?? null : null,
  }));
  return { students };
}

export async function assignStudentToTeacher(
  studentUserId: string,
  teacherUserId: string | null
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const supabase = createServiceClient();
  if (!teacherUserId) {
    await supabase.from("student_teacher").delete().eq("student_user_id", studentUserId);
    await supabase
      .from("user_profiles")
      .update({ role: "user", updated_at: new Date().toISOString() })
      .eq("id", studentUserId);
    return {};
  }
  const { error: upsertErr } = await supabase.from("student_teacher").upsert(
    { student_user_id: studentUserId, teacher_user_id: teacherUserId },
    { onConflict: "student_user_id" }
  );
  if (upsertErr) return { error: upsertErr.message };
  await supabase
    .from("user_profiles")
    .update({ role: "student", updated_at: new Date().toISOString() })
    .eq("id", studentUserId);
  return {};
}

/** All profiles (for admin dropdowns). Only id, username, email, role. */
export async function getAllProfilesForAdmin(): Promise<
  { error?: string; profiles?: { id: string; username: string; email: string | null; role: string }[] } | void
> {
  if (!(await isAdmin())) return { error: "Forbidden" };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, username, email, role")
    .order("username");
  if (error) return { error: error.message };
  return { profiles: data ?? [] };
}
