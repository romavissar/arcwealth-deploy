import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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

export default async function ClassroomPage() {
  const { userId } = await auth();
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
        <div className="max-w-2xl mx-auto">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Classroom</h1>
        <ClassroomViewTeacher
          teacherUserId={userId}
          students={studentsRes.students ?? []}
          messages={messagesRes.messages ?? []}
          assignments={assignmentsRes.assignments ?? []}
        />
      </div>
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
        <div className="max-w-2xl mx-auto">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }
    const people = peopleRes.people!;
    const studentIds = people.students.map((s) => s.id);
    const { statusByUserId } = studentIds.length
      ? await getFriendStatusForUsers(studentIds)
      : { statusByUserId: {} as Record<string, "friends" | "pending_sent" | "pending_received" | "none"> };
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Classroom</h1>
        <ClassroomViewStudent
          people={people}
          messages={messagesRes.messages ?? []}
          assignments={assignmentsRes.assignments ?? []}
          assignmentStatus={statusRes}
          friendStatusByUserId={statusByUserId ?? {}}
          currentUserId={userId}
        />
      </div>
    );
  }

  redirect("/dashboard");
}
