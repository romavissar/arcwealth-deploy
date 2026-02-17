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
      <div className="max-w-2xl mx-auto">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  const classrooms = classroomsRes.classrooms ?? [];

  if (!teacherId) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">All Classrooms</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Select a classroom to view.</p>
        {classrooms.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No classrooms yet (no teachers with assigned students).</p>
        ) : (
          <ul className="space-y-2">
            {classrooms.map((c) => (
              <li key={c.teacherUserId}>
                <Link
                  href={`/admin/classrooms?teacher=${encodeURIComponent(c.teacherUserId)}`}
                  className="block rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">{c.teacherUsername}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({c.studentCount} student{c.studentCount !== 1 ? "s" : ""})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
      <div className="max-w-2xl mx-auto">
        <p className="text-red-600 dark:text-red-400">{viewError}</p>
      </div>
    );
  }

  const teacherName = classrooms.find((c) => c.teacherUserId === teacherId)?.teacherUsername ?? "Classroom";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Link
          href="/admin/classrooms"
          className="text-sm text-primary hover:underline"
        >
          ← All Classrooms
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {teacherName}&apos;s classroom
        </h1>
      </div>
      <ClassroomViewTeacher
        teacherUserId={teacherId}
        students={studentsRes.students ?? []}
        messages={messagesRes.messages ?? []}
        assignments={assignmentsRes.assignments ?? []}
      />
    </div>
  );
}
