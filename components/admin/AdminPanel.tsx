"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  setAllowedStudentEmailEndings,
  addTeacherByEmail,
  removeTeacher,
  assignStudentToTeacher,
  getAdminConfig,
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

  async function handleSaveEndings() {
    const res = await setAllowedStudentEmailEndings(endings);
    if (res?.error) {
      setMessage({ type: "err", text: res.error });
    } else {
      setMessage({ type: "ok", text: "Saved." });
    }
  }

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
    <div className="space-y-10">
      {message && (
        <p className={message.type === "err" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
          {message.text}
        </p>
      )}

      <section className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Student email endings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Users whose email ends with one of these (e.g. @student.goaisb.ro) can be assigned as students.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-4">
          {endings.map((e) => (
            <li key={e} className="flex items-center gap-2">
              <span>{e}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveEnding(e)}>
                Remove
              </Button>
            </li>
          ))}
          {endings.length === 0 && <li className="text-gray-500">None yet</li>}
        </ul>
        <div className="flex gap-2">
          <Input
            placeholder="@student.goaisb.ro"
            value={newEnding}
            onChange={(e) => setNewEnding(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAddEnding}>Add</Button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Teachers</h2>
        <ul className="mb-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {teachers.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <span>{t.username} {t.email && <span className="text-gray-500">({t.email})</span>}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTeacher(t.id)}
                disabled={removingTeacherId === t.id}
              >
                {removingTeacherId === t.id ? "Removing…" : "Remove"}
              </Button>
            </li>
          ))}
          {teachers.length === 0 && <li className="text-gray-500">No teachers yet</li>}
        </ul>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Teacher email (user must have signed in once)"
            value={newTeacherEmail}
            onChange={(e) => setNewTeacherEmail(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleAddTeacher}>Add teacher</Button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Students</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600 text-left">
              <th className="py-2 pr-4">User / Email</th>
              <th className="py-2 pr-4">XP · Rank · Streak</th>
              <th className="py-2">Assign teacher</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-3 pr-4">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{s.username}</span>
                  {s.email && <span className="text-gray-500 block">{s.email}</span>}
                </td>
                <td className="py-3 pr-4">
                  {s.xp} XP · {s.rank} · Level {s.level} · {s.streak_days}d streak
                </td>
                <td className="py-3">
                  <select
                    className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1"
                    value={s.teacher_id ?? ""}
                    disabled={assigning === s.id}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleAssignStudent(s.id, v || null);
                    }}
                  >
                    <option value="">— No teacher —</option>
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
        {students.length === 0 && (
          <p className="text-sm text-gray-500 py-4">No users yet. Users appear here after they sign in.</p>
        )}
      </section>
    </div>
  );
}
