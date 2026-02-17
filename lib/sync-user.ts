import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "romavissar@gmail.com";

export type UserRole = "admin" | "teacher" | "student" | "user";

/** Resolve role for a user: admin by email, else from user_profiles.role. */
export function resolveRole(profileRole: string | null, email: string | null | undefined): UserRole {
  if (email?.toLowerCase() === ADMIN_EMAIL) return "admin";
  return (profileRole as UserRole) ?? "user";
}

/**
 * Ensures a Clerk user has a row in user_profiles and user_progress.
 * Sets role to admin if email is ADMIN_EMAIL; otherwise keeps existing role.
 * Syncs email to user_profiles for admin/student matching.
 */
export async function ensureUserInSupabase(
  userId: string,
  opts?: { username?: string; imageUrl?: string; email?: string }
) {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id, username, role")
    .eq("id", userId)
    .single();

  const displayName = opts?.username?.trim().slice(0, 50) || null;
  const suffix = Date.now().toString(36).slice(-6);
  const fullNameWithSuffix = displayName ? `${displayName}_${suffix}` : `user_${suffix}`;
  const email = opts?.email?.trim().toLowerCase() || null;
  const isAdminEmail = email === ADMIN_EMAIL;
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    ...(opts?.imageUrl != null && { avatar_url: opts.imageUrl }),
    ...(email != null && { email }),
    ...(isAdminEmail && { role: "admin" }),
  };

  if (existing) {
    const { data: inTeacherList } = await supabase
      .from("teacher_list")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: inStudentTeacher } = await supabase
      .from("student_teacher")
      .select("student_user_id")
      .eq("student_user_id", userId)
      .maybeSingle();
    const isStudent = !!inStudentTeacher;
    if (inTeacherList) {
      updatePayload.role = "teacher";
    }
    // Students cannot change name or email: keep existing DB values (do not sync from Clerk)
    if (!isStudent) {
      if (displayName) updatePayload.username = displayName;
      if (email != null) updatePayload.email = email;
    }
    if (Object.keys(updatePayload).length > 1) {
      const { error: updateErr } = await supabase
        .from("user_profiles")
        .update(updatePayload)
        .eq("id", userId);
      if (updateErr && updateErr.code === "23505" && updatePayload.username && !isStudent) {
        await supabase
          .from("user_profiles")
          .update({
            username: fullNameWithSuffix,
            ...(opts?.imageUrl != null && { avatar_url: opts.imageUrl }),
            ...(email != null && { email }),
            ...(isAdminEmail && { role: "admin" }),
            ...(inTeacherList && { role: "teacher" }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }
    return;
  }

  const username = displayName || "user";
  const role = isAdminEmail ? "admin" : "user";
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: userId,
    username,
    avatar_url: opts?.imageUrl ?? null,
    rank: "novice",
    email: email ?? null,
    role,
  });
  if (profileError) {
    await supabase.from("user_profiles").insert({
      id: userId,
      username: fullNameWithSuffix,
      avatar_url: opts?.imageUrl ?? null,
      rank: "novice",
      email: email ?? null,
      role: role as "admin" | "user",
    });
  }
  const { data: topics } = await supabase.from("topics").select("topic_id").order("order_index");
  if (topics?.length) {
    const rows = topics.map((t) => ({
      user_id: userId,
      topic_id: t.topic_id,
      status: t.topic_id === "1.1.1" ? "available" : "locked",
    }));
    await supabase.from("user_progress").upsert(rows, {
      onConflict: "user_id,topic_id",
      ignoreDuplicates: true,
    });
  }
}
