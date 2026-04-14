"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardList, MessageSquare, Users } from "lucide-react";
import type { StudentProgress } from "@/app/actions/teacher";
import type { ClassroomAssignment, ClassroomMessage } from "@/app/actions/classroom";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import {
  createClassroomAssignment,
  getAssignmentCompletion,
  postClassroomMessage,
} from "@/app/actions/classroom";
import { getLessonTitle } from "@/lib/curriculum";
import { formatDateTimeInBucharest } from "@/lib/bucharest-time";
import { SettingsCard } from "@/components/account/SettingsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("students");
  const [uiMessages, setUiMessages] = useState(messages);
  const [uiAssignments, setUiAssignments] = useState(assignments);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
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

  function showNotice(tone: "success" | "error", text: string) {
    setNotice({ tone, text });
  }

  async function handlePostMessage() {
    const trimmed = messageContent.trim();
    if (!trimmed || posting) return;

    setNotice(null);
    setPosting(true);
    const res = await postClassroomMessage(teacherUserId, trimmed);
    setPosting(false);
    if (res?.error) {
      showNotice("error", res.error);
      return;
    }

    setUiMessages((current) => [
      {
        id: `local-message-${Date.now()}`,
        content: trimmed,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setMessageContent("");
    showNotice("success", "Announcement posted.");
    router.refresh();
  }

  async function handleCreateAssignment() {
    if (!newTopicId.trim() || !newDueDate || creating) return;

    setNotice(null);
    setCreating(true);
    const res = await createClassroomAssignment(
      teacherUserId,
      newTopicId.trim(),
      newDueDate,
      newDueTime,
      newTitle.trim() || undefined
    );
    setCreating(false);
    if (res?.error) {
      showNotice("error", res.error);
      return;
    }

    const localDueAt = `${newDueDate}T${newDueTime || "23:59"}:00`;
    setUiAssignments((current) => [
      ...current,
      {
        id: `local-assignment-${Date.now()}`,
        topicId: newTopicId.trim(),
        dueAt: localDueAt,
        title: newTitle.trim() || null,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewTopicId("");
    setNewDueDate("");
    setNewDueTime("23:59");
    setNewTitle("");
    showNotice("success", "Assignment created.");
    router.refresh();
  }

  async function handleViewCompletion(assignmentId: string) {
    setNotice(null);
    setCompletionForId(assignmentId);
    const res = await getAssignmentCompletion(assignmentId);
    setCompletionForId(null);
    if (res?.error) {
      showNotice("error", res.error);
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
      <nav
        aria-label="Teacher classroom sections"
        className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/60"
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                tab === id
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {notice ? (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
          )}
          role={notice.tone === "error" ? "alert" : "status"}
          aria-live={notice.tone === "error" ? "assertive" : "polite"}
        >
          {notice.text}
        </div>
      ) : null}

      {tab === "students" && <TeacherDashboard students={students} />}

      {tab === "announcements" && (
        <div className="space-y-6">
          <SettingsCard className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Announcements</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">Post a class update</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Share reminders, encouragement, and important notes with your students.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="announcement-content">New announcement</Label>
              <textarea
                id="announcement-content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Write a message to your class..."
                className="min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
                rows={4}
              />
            </div>
            <Button onClick={handlePostMessage} disabled={posting || !messageContent.trim()}>
              {posting ? "Posting..." : "Post"}
            </Button>
          </SettingsCard>

          <SettingsCard className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">History</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">Past announcements</h2>
            </div>
            {uiMessages.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No announcements yet.
              </p>
            ) : (
              uiMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/60"
                >
                  <p className="mb-1 text-xs font-medium text-primary dark:text-primary/90">From you (teacher)</p>
                  <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{message.content}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTimeInBucharest(message.createdAt)} (EET)
                  </p>
                </div>
              ))
            )}
          </SettingsCard>
        </div>
      )}

      {tab === "assignments" && (
        <div className="space-y-6">
          <SettingsCard className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Assignments</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">Create assignment</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Assign focused lessons and set clear due dates in Bucharest time.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="assignment-topic">Topic (e.g. 1.1.3)</Label>
                <Input
                  id="assignment-topic"
                  type="text"
                  value={newTopicId}
                  onChange={(e) => setNewTopicId(e.target.value)}
                  placeholder="1.1.3"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignment-due-date">Due date (EET)</Label>
                <Input
                  id="assignment-due-date"
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignment-due-time">Due time (EET Bucharest)</Label>
                <Input
                  id="assignment-due-time"
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignment-title">Title (optional)</Label>
              <Input
                id="assignment-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Complete Impulse Spending"
              />
            </div>
            <Button
              onClick={handleCreateAssignment}
              disabled={creating || !newTopicId.trim() || !newDueDate || !newDueTime}
            >
              {creating ? "Creating..." : "Create assignment"}
            </Button>
          </SettingsCard>

          <SettingsCard className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tracking</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">Assignments</h2>
            </div>
            {uiAssignments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No assignments yet.
              </p>
            ) : (
              <div className="space-y-2">
                {uiAssignments.map((assignment) => {
                  const due = new Date(assignment.dueAt);
                  const isPastDue = due < new Date();
                  return (
                    <div
                      key={assignment.id}
                      className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/60"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {assignment.title || getLessonTitle(assignment.topicId)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Topic {assignment.topicId} · Due {formatDateTimeInBucharest(assignment.dueAt)} (EET)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                              isPastDue
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            )}
                          >
                            {isPastDue ? "Due passed" : "In progress"}
                          </span>
                          {isPastDue ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewCompletion(assignment.id)}
                              disabled={completionForId === assignment.id}
                            >
                              {completionForId === assignment.id ? "Loading..." : "View completion"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SettingsCard>

          {completionData ? (
            <SettingsCard className="space-y-3 border-primary/30">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Completion status</p>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {completionData.assignment.title || getLessonTitle(completionData.assignment.topicId)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Due {formatDateTimeInBucharest(completionData.assignment.dueAt)} (EET)
              </p>
              <ul className="space-y-1 text-sm">
                {completionData.completion.map((row) => (
                  <li key={row.studentUserId} className="flex items-center gap-2">
                    <span className={row.completed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}>
                      {row.completed ? "✓" : "○"}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{row.username}</span>
                    {row.completed && row.completedAt ? (
                      <span className="text-xs text-gray-500">
                        completed {new Date(row.completedAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="sm" onClick={() => setCompletionData(null)}>
                Close
              </Button>
            </SettingsCard>
          ) : null}
        </div>
      )}
    </div>
  );
}
