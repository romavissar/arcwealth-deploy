import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/roles";
import { getAdminConfig, getTeachers, getStudentsWithTeachers, getAllProfilesForAdmin } from "@/app/actions/admin";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default async function AdminPage() {
  const ok = await isAdmin();
  if (!ok) redirect("/dashboard");

  const [configRes, teachersRes, studentsRes, profilesRes] = await Promise.all([
    getAdminConfig(),
    getTeachers(),
    getStudentsWithTeachers(),
    getAllProfilesForAdmin(),
  ]);

  const error = (configRes as { error?: string })?.error ?? (teachersRes as { error?: string })?.error;
  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-4">
        <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Admin Control Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300">
            Manage teachers, student assignments, and classroom access rules.
          </p>
        </section>
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/50 dark:bg-red-950/30">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">Unable to load admin data</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Admin Control Center
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300">
          Manage teacher permissions, approved student domains, and student-to-teacher assignments.
        </p>
      </section>
      <AdminPanel
        allowedStudentEmailEndings={(configRes as { allowedStudentEmailEndings?: string[] }).allowedStudentEmailEndings ?? []}
        teachers={(teachersRes as { teachers?: { id: string; username: string; email: string | null }[] }).teachers ?? []}
        students={(studentsRes as { students?: Array<{
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
        }> }).students ?? []}
        profiles={(profilesRes as { profiles?: { id: string; username: string; email: string | null; role: string }[] }).profiles ?? []}
      />
    </div>
  );
}
