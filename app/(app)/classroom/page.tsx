import { redirect } from "next/navigation";
import { getAppUserId } from "@/lib/auth/server-user";
import { getCurrentUserRole } from "@/lib/roles";
import {
  getMyClassroomTeacherId,
  getClassroomStudents,
  getClassroomMessages,
  getClassroomAssignments,
  getClassroomPeople,
  getMyAssignmentStatus,
} from "@/app/actions/classroom";
import { getFriendStatusForUsers } from "@/app/actions/friends";
import { ClassroomViewTeacher } from "@/components/classroom/ClassroomViewTeacher";
import { ClassroomViewStudent } from "@/components/classroom/ClassroomViewStudent";

function ClassroomShell({
  roleLabel,
  title,
  description,
  stats,
  children,
}: {
  roleLabel: string;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{roleLabel}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}

export default async function ClassroomPage() {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");
  const role = await getCurrentUserRole();

  if (role === "admin") {
    redirect("/admin/classrooms");
  }

  if (role === "teacher") {
    const [studentsRes, messagesRes, assignmentsRes] = await Promise.all([
      getClassroomStudents(userId),
      getClassroomMessages(userId),
      getClassroomAssignments(userId),
    ]);
    const error = studentsRes.error ?? messagesRes.error ?? assignmentsRes.error;
    if (error) {
      return (
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }
    const activeAssignments = (assignmentsRes.assignments ?? []).filter(
      (assignment) => new Date(assignment.dueAt) >= new Date()
    ).length;
    return (
      <ClassroomShell
        roleLabel="Teacher classroom"
        title="Classroom hub"
        description="Track student momentum, post announcements, and assign learning goals from one place."
        stats={[
          { label: "Students", value: String((studentsRes.students ?? []).length) },
          { label: "Announcements", value: String((messagesRes.messages ?? []).length) },
          { label: "Active assignments", value: String(activeAssignments) },
        ]}
      >
        <ClassroomViewTeacher
          teacherUserId={userId}
          students={studentsRes.students ?? []}
          messages={messagesRes.messages ?? []}
          assignments={assignmentsRes.assignments ?? []}
        />
      </ClassroomShell>
    );
  }

  if (role === "student" || role === "user") {
    const teacherId = await getMyClassroomTeacherId();
    if (!teacherId) redirect("/dashboard");
    const [peopleRes, messagesRes, assignmentsRes, statusRes] = await Promise.all([
      getClassroomPeople(teacherId),
      getClassroomMessages(teacherId),
      getClassroomAssignments(teacherId),
      getMyAssignmentStatus(teacherId),
    ]);
    const error = peopleRes.error ?? messagesRes.error ?? assignmentsRes.error;
    if (error) {
      return (
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }
    const people = peopleRes.people!;
    const studentIds = people.students.map((s) => s.id);
    const { statusByUserId } = studentIds.length
      ? await getFriendStatusForUsers(studentIds)
      : { statusByUserId: {} as Record<string, "friends" | "pending_sent" | "pending_received" | "none"> };
    const pendingAssignments = (statusRes ?? []).filter((assignment) => !assignment.completed).length;
    return (
      <ClassroomShell
        roleLabel="Student classroom"
        title="Classroom hub"
        description="Stay aligned with your teacher, classmates, and assignment deadlines."
        stats={[
          { label: "Classmates", value: String(people.students.length) },
          { label: "Announcements", value: String((messagesRes.messages ?? []).length) },
          { label: "Pending tasks", value: String(pendingAssignments) },
        ]}
      >
        <ClassroomViewStudent
          people={people}
          messages={messagesRes.messages ?? []}
          assignments={assignmentsRes.assignments ?? []}
          assignmentStatus={statusRes}
          friendStatusByUserId={statusByUserId ?? {}}
          currentUserId={userId}
        />
      </ClassroomShell>
    );
  }

  redirect("/dashboard");
}
