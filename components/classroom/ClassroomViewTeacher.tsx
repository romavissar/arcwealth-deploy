"use client";

import { useState } from "react";
import { Users, MessageSquare, ClipboardList } from "lucide-react";
import type { StudentProgress } from "@/app/actions/teacher";
import type { ClassroomMessage, ClassroomAssignment } from "@/app/actions/classroom";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import {
  postClassroomMessage,
  createClassroomAssignment,
  getAssignmentCompletion,
} from "@/app/actions/classroom";
import { getLessonTitle } from "@/lib/curriculum";
import { formatDateTimeInBucharest } from "@/lib/bucharest-time";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "students" | "announcements" | "assignments";

export function ClassroomViewTeacher({
  teacherUserId,
  students,
  messages,
  assignments,
}: {
  teacherUserId: string;
  students: StudentProgress[];
  messages: ClassroomMessage[];
  assignments: ClassroomAssignment[];
}) {
  const [tab, setTab] = useState<Tab>("students");
  const [messageContent, setMessageContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [newTopicId, setNewTopicId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("23:59");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [completionForId, setCompletionForId] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<{
    assignment: { topicId: string; dueAt: string; title: string | null };
    completion: { studentUserId: string; username: string; completed: boolean; completedAt: string | null }[];
  } | null>(null);

  async function handlePostMessage() {
    const trimmed = messageContent.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    const res = await postClassroomMessage(teacherUserId, trimmed);
    setPosting(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setMessageContent("");
    window.location.reload();
  }

  async function handleCreateAssignment() {
    if (!newTopicId.trim() || !newDueDate || creating) return;
    setCreating(true);
    const res = await createClassroomAssignment(teacherUserId, newTopicId.trim(), newDueDate, newDueTime, newTitle.trim() || undefined);
    setCreating(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setNewTopicId("");
    setNewDueDate("");
    setNewDueTime("23:59");
    setNewTitle("");
    window.location.reload();
  }

  async function handleViewCompletion(assignmentId: string) {
    setCompletionForId(assignmentId);
    const res = await getAssignmentCompletion(assignmentId);
    if (res?.error) {
      alert(res.error);
      setCompletionForId(null);
      return;
    }
    setCompletionData(res.completion ? { assignment: res.assignment!, completion: res.completion } : null);
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "students", label: "Students", icon: Users },
    { id: "announcements", label: "Announcements", icon: MessageSquare },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "students" && <TeacherDashboard students={students} />}

      {tab === "announcements" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New announcement</h3>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Write a message to your class..."
              className="w-full min-h-[100px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
              rows={3}
            />
            <Button onClick={handlePostMessage} disabled={posting || !messageContent.trim()} className="mt-2">
              {posting ? "Posting…" : "Post"}
            </Button>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Past announcements</h3>
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No announcements yet.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4"
                >
                  <p className="text-xs font-medium text-primary dark:text-primary/90 mb-1">From you (teacher)</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{m.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "assignments" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Create assignment</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Topic (e.g. 1.1.3)</label>
                <input
                  type="text"
                  value={newTopicId}
                  onChange={(e) => setNewTopicId(e.target.value)}
                  placeholder="1.1.3"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due date (EET)</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due time (EET Bucharest)</label>
                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title (optional)</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Complete Impulse Spending"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              />
            </div>
            <Button
              onClick={handleCreateAssignment}
              disabled={creating || !newTopicId.trim() || !newDueDate || !newDueTime}
              className="mt-3"
            >
              {creating ? "Creating…" : "Create assignment"}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignments</h3>
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No assignments yet.</p>
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => {
                  const due = new Date(a.dueAt);
                  const isPastDue = due < new Date();
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {a.title || getLessonTitle(a.topicId)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Topic {a.topicId} · Due {formatDateTimeInBucharest(a.dueAt)} (EET)
                        </p>
                      </div>
                      {isPastDue && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewCompletion(a.id)}
                          disabled={completionForId === a.id}
                        >
                          {completionForId === a.id ? "Loading…" : "View completion"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {completionData && (
            <div className="rounded-xl border-2 border-primary/30 bg-white dark:bg-gray-800 p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Completion: {completionData.assignment.title || getLessonTitle(completionData.assignment.topicId)} (due {formatDateTimeInBucharest(completionData.assignment.dueAt)} EET)
              </h3>
              <ul className="space-y-1 text-sm">
                {completionData.completion.map((row) => (
                  <li key={row.studentUserId} className="flex items-center gap-2">
                    <span className={row.completed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                      {row.completed ? "✓" : "○"}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{row.username}</span>
                    {row.completed && row.completedAt && (
                      <span className="text-xs text-gray-500">completed {new Date(row.completedAt).toLocaleDateString()}</span>
                    )}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setCompletionData(null)}>
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
