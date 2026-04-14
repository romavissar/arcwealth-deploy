import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";
import {
  getAllClassrooms,
  getClassroomStudents,
  getClassroomMessages,
  getClassroomAssignments,
} from "@/app/actions/classroom";
import { ClassroomViewTeacher } from "@/components/classroom/ClassroomViewTeacher";

type Props = { searchParams: Promise<{ teacher?: string }> };

export default async function AdminClassroomsPage({ searchParams }: Props) {
  const ok = await isAdmin();
  if (!ok) redirect("/dashboard");

  const params = await searchParams;
  const teacherId = params.teacher?.trim();

  const classroomsRes = await getAllClassrooms();
  const error = classroomsRes.error;
  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-4">
        <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin Classrooms</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Classroom Oversight
          </h1>
        </section>
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/50 dark:bg-red-950/30">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">Unable to load classrooms</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        </section>
      </div>
    );
  }
  const classrooms = classroomsRes.classrooms ?? [];

  if (!teacherId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-4">
        <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin Classrooms</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Classroom Oversight
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300">
            Select a teacher classroom to review student progress, announcements, and assignments.
          </p>
        </section>
        {classrooms.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No classrooms yet (no teachers with assigned students).
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Classrooms</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Choose a teacher to open classroom details.</p>
            </div>
            <ul className="space-y-3">
              {classrooms.map((c) => (
                <li key={c.teacherUserId}>
                  <Link
                    href={`/admin/classrooms?teacher=${encodeURIComponent(c.teacherUserId)}`}
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-primary/50 dark:hover:bg-primary/10"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">{c.teacherUsername}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {c.studentCount} student{c.studentCount !== 1 ? "s" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  const [studentsRes, messagesRes, assignmentsRes] = await Promise.all([
    getClassroomStudents(teacherId),
    getClassroomMessages(teacherId),
    getClassroomAssignments(teacherId),
  ]);
  const viewError = studentsRes.error ?? messagesRes.error ?? assignmentsRes.error;
  if (viewError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-4">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/50 dark:bg-red-950/30">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">Unable to load classroom details</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{viewError}</p>
        </section>
      </div>
    );
  }

  const teacherName = classrooms.find((c) => c.teacherUserId === teacherId)?.teacherUsername ?? "Classroom";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin Classrooms</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/classrooms"
            className="inline-flex items-center rounded-lg border border-primary/25 bg-white/80 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 dark:border-primary/35 dark:bg-gray-900/50"
          >
            Back to all classrooms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teacherName}&apos;s classroom</h1>
        </div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
        <ClassroomViewTeacher
          teacherUserId={teacherId}
          students={studentsRes.students ?? []}
          messages={messagesRes.messages ?? []}
          assignments={assignmentsRes.assignments ?? []}
        />
      </section>
    </div>
  );
}
