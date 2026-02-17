import { redirect } from "next/navigation";
import { canAccessTeacherDashboard } from "@/lib/roles";
import { getMyStudents } from "@/app/actions/teacher";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";

export default async function TeacherPage() {
  const ok = await canAccessTeacherDashboard();
  if (!ok) redirect("/dashboard");

  const res = await getMyStudents();
  const error = (res as { error?: string })?.error;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const students = (res as { students?: import("@/app/actions/teacher").StudentProgress[] })?.students ?? [];
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">My students</h1>
      <TeacherDashboard students={students} />
    </div>
  );
}
