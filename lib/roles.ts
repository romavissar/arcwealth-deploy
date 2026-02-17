import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveRole, type UserRole } from "./sync-user";

const ADMIN_EMAIL = "romavissar@gmail.com";

export type { UserRole };

/** Get current user's role (admin by email, else from DB). Returns null if not signed in.
 * Users with a student_teacher link are treated as "student" so Classroom tab appears even if profile.role was never set. */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = createServiceClient();
  const [{ data: profile }, { data: inClassroom }] = await Promise.all([
    supabase.from("user_profiles").select("role, email").eq("id", userId).single(),
    supabase.from("student_teacher").select("student_user_id").eq("student_user_id", userId).maybeSingle(),
  ]);
  const email = profile?.email ?? null;
  let role = resolveRole(profile?.role ?? null, email);
  // Show Classroom for anyone linked to a teacher, even if profile.role is still "user"
  if (role === "user" && inClassroom) role = "student";
  return role;
}

/** Primary email from Clerk (for admin/role checks). */
export async function getClerkPrimaryEmail(): Promise<string | null> {
  const user = await currentUser();
  const primary = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;
  return primary?.trim().toLowerCase() ?? null;
}

/** True if current user is admin (only romavissar@gmail.com). Checks DB profile email and Clerk primary email. */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const supabase = createServiceClient();
  const { data } = await supabase.from("user_profiles").select("email").eq("id", userId).single();
  const profileEmail = data?.email?.trim().toLowerCase() ?? null;
  if (profileEmail === ADMIN_EMAIL) return true;
  const clerkEmail = await getClerkPrimaryEmail();
  return clerkEmail === ADMIN_EMAIL;
}

/** True if current user can access admin panel. */
export async function canAccessAdmin(): Promise<boolean> {
  return isAdmin();
}

/** True if current user can access teacher dashboard (teacher or admin). */
export async function canAccessTeacherDashboard(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === "teacher" || role === "admin";
}
