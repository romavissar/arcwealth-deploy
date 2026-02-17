"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, Users, ClipboardList } from "lucide-react";
import type { ClassroomMessage, ClassroomAssignment } from "@/app/actions/classroom";
import type { ClassroomPeople } from "@/app/actions/classroom";
import { getLessonTitle } from "@/lib/curriculum";
import { formatDateTimeInBucharest } from "@/lib/bucharest-time";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "people" | "announcements" | "assignments";

export function ClassroomViewStudent({
  people,
  messages,
  assignments,
  assignmentStatus,
}: {
  people: ClassroomPeople;
  messages: ClassroomMessage[];
  assignments: ClassroomAssignment[];
  assignmentStatus: { assignmentId: string; topicId: string; dueAt: string; completed: boolean }[];
}) {
  const statusByAssignmentId = new Map(assignmentStatus.map((s) => [s.assignmentId, s]));

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "people", label: "People", icon: Users },
    { id: "announcements", label: "Announcements", icon: MessageSquare },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
  ];

  const [tab, setTab] = useState<Tab>("people");

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

      {tab === "people" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Teacher</h3>
          <div className="flex items-center gap-3">
            {people.teacher.avatarUrl ? (
              <Image
                src={people.teacher.avatarUrl}
                alt=""
                width={40}
                height={40}
                className="rounded-full object-cover h-10 w-10"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium text-sm">
                {people.teacher.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{people.teacher.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{people.teacher.rank} · Level {people.teacher.level}</p>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">Classmates</h3>
          {people.students.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No other students in this class yet.</p>
          ) : (
            <ul className="space-y-3">
              {people.students.map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                  {s.avatarUrl ? (
                    <Image
                      src={s.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full object-cover h-10 w-10"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium text-sm shrink-0">
                      {s.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{s.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s.rank} · Level {s.level}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "announcements" && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Announcements</h3>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No announcements yet.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4"
              >
                <p className="text-xs font-medium text-primary dark:text-primary/90 mb-1">
                  From your teacher, {people.teacher.username}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{m.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "assignments" && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignments</h3>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No assignments yet.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => {
                const status = statusByAssignmentId.get(a.id);
                const completed = status?.completed ?? false;
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
                        {isPastDue && !completed && (
                          <span className="text-amber-600 dark:text-amber-400 ml-1">(past due)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          completed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"
                        )}
                      >
                        {completed ? "Done" : "Not done"}
                      </span>
                      {!completed && (
                        <Link
                          href={`/learn/${a.topicId}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Go to lesson
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
