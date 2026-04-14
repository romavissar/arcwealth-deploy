"use client";

import { useState } from "react";
import { SettingsCard } from "@/components/account/SettingsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  setAllowedStudentEmailEndings,
  addTeacherByEmail,
  removeTeacher,
  assignStudentToTeacher,
  getTeachers,
  getStudentsWithTeachers,
} from "@/app/actions/admin";

type Teacher = { id: string; username: string; email: string | null };
type Student = {
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
};
type Profile = { id: string; username: string; email: string | null; role: string };

interface AdminPanelProps {
  allowedStudentEmailEndings: string[];
  teachers: Teacher[];
  students: Student[];
  profiles: Profile[];
}

export function AdminPanel({
  allowedStudentEmailEndings: initialEndings,
  teachers: initialTeachers,
  students: initialStudents,
  profiles,
}: AdminPanelProps) {
  const [endings, setEndings] = useState(initialEndings);
  const [newEnding, setNewEnding] = useState("");
  const [teachers, setTeachers] = useState(initialTeachers);
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [removingTeacherId, setRemovingTeacherId] = useState<string | null>(null);
  const [students, setStudents] = useState(initialStudents);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const teacherCount = teachers.length;
  const studentCount = students.length;
  const profileCount = profiles.length;

  async function handleAddEnding() {
    const v = newEnding.trim().toLowerCase();
    if (!v) return;
    if (!v.startsWith("@")) {
      setMessage({ type: "err", text: "Enter an email suffix starting with @ (e.g. @student.goaisb.ro)" });
      return;
    }
    if (endings.includes(v)) {
      setMessage({ type: "err", text: "Already in list." });
      return;
    }
    const next = [...endings, v];
    setEndings(next);
    setNewEnding("");
    const res = await setAllowedStudentEmailEndings(next);
    if (res?.error) setMessage({ type: "err", text: res.error });
    else setMessage({ type: "ok", text: "Added." });
  }

  function handleRemoveEnding(suffix: string) {
    const next = endings.filter((e) => e !== suffix);
    setEndings(next);
    setAllowedStudentEmailEndings(next).then((res) => {
      if (res?.error) setMessage({ type: "err", text: res.error });
    });
  }

  async function handleAddTeacher() {
    const email = newTeacherEmail.trim();
    if (!email) return;
    setMessage(null);
    const res = await addTeacherByEmail(email);
    if (res?.error) {
      setMessage({ type: "err", text: res.error });
    } else {
      setMessage({ type: "ok", text: "Teacher added." });
      setNewTeacherEmail("");
      const r = await getTeachers();
      if (!(r as { error?: string }).error && (r as { teachers?: Teacher[] }).teachers)
        setTeachers((r as { teachers: Teacher[] }).teachers);
    }
  }

  async function handleRemoveTeacher(teacherId: string) {
    setMessage(null);
    setRemovingTeacherId(teacherId);
    const res = await removeTeacher(teacherId);
    setRemovingTeacherId(null);
    if (res?.error) {
      setMessage({ type: "err", text: res.error });
    } else {
      setMessage({ type: "ok", text: "Teacher removed." });
      const [teachersRes, studentsRes] = await Promise.all([getTeachers(), getStudentsWithTeachers()]);
      if (!(teachersRes as { error?: string }).error && (teachersRes as { teachers?: Teacher[] }).teachers)
        setTeachers((teachersRes as { teachers: Teacher[] }).teachers);
      if (!(studentsRes as { error?: string }).error && (studentsRes as { students?: Student[] }).students)
        setStudents((studentsRes as { students: Student[] }).students);
    }
  }

  async function handleAssignStudent(studentId: string, teacherId: string | null) {
    setAssigning(studentId);
    setMessage(null);
    const res = await assignStudentToTeacher(studentId, teacherId);
    setAssigning(null);
    if (res?.error) {
      setMessage({ type: "err", text: res.error });
    } else {
      setMessage({ type: "ok", text: "Updated." });
      const r = await getStudentsWithTeachers();
      if (!(r as { error?: string }).error && (r as { students?: Student[] }).students)
        setStudents((r as { students: Student[] }).students);
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          role="status"
          aria-live="polite"
          className={
            message.type === "err"
              ? "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              : "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
          }
        >
          {message.text}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Teachers</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{teacherCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Students</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{studentCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">User Profiles</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{profileCount}</p>
        </div>
      </section>

      <SettingsCard className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Approved student email domains</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Users whose email ends with one of these (e.g. @student.goaisb.ro) can be assigned as students.
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          {endings.map((e) => (
            <li
              key={e}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/70"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{e}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveEnding(e)}>
                Remove
              </Button>
            </li>
          ))}
          {endings.length === 0 && (
            <li className="rounded-xl border border-dashed border-gray-300 px-3 py-2 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No domains added yet.
            </li>
          )}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="@student.goaisb.ro"
            value={newEnding}
            onChange={(e) => setNewEnding(e.target.value)}
            className="sm:max-w-sm"
          />
          <Button onClick={handleAddEnding} className="sm:min-w-28">Add domain</Button>
        </div>
      </SettingsCard>

      <SettingsCard className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Teacher access</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Promote users to teacher role and manage active teacher accounts.
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          {teachers.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/70"
            >
              <span className="text-gray-900 dark:text-gray-100">
                <span className="font-medium">{t.username}</span>
                {t.email && <span className="ml-2 text-gray-500 dark:text-gray-400">({t.email})</span>}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTeacher(t.id)}
                disabled={removingTeacherId === t.id}
              >
                {removingTeacherId === t.id ? "Removing..." : "Remove"}
              </Button>
            </li>
          ))}
          {teachers.length === 0 && (
            <li className="rounded-xl border border-dashed border-gray-300 px-3 py-2 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No teachers yet.
            </li>
          )}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            placeholder="Teacher email (user must have signed in once)"
            value={newTeacherEmail}
            onChange={(e) => setNewTeacherEmail(e.target.value)}
            className="sm:max-w-md"
          />
          <Button onClick={handleAddTeacher} className="sm:min-w-32">Add teacher</Button>
        </div>
      </SettingsCard>

      <SettingsCard className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Student assignments</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Assign each student to a teacher classroom for progress tracking and classroom tools.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                <th className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">User / Email</th>
                <th className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">XP · Rank · Streak</th>
                <th className="py-2 font-semibold text-gray-700 dark:text-gray-300">Assign teacher</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{s.username}</span>
                    {s.email && <span className="block text-gray-500 dark:text-gray-400">{s.email}</span>}
                  </td>
                  <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                    {s.xp} XP · {s.rank} · Level {s.level} · {s.streak_days}d streak
                  </td>
                  <td className="py-3">
                    <select
                      className="h-10 min-w-44 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={s.teacher_id ?? ""}
                      disabled={assigning === s.id}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleAssignStudent(s.id, v || null);
                      }}
                    >
                      <option value="">No teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.username}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {students.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No users yet. Users appear here after they sign in.
          </p>
        )}
      </SettingsCard>
    </div>
  );
}
