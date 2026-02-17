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
      <div className="max-w-2xl mx-auto">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Admin panel</h1>
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
