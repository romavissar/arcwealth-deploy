"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, Users, ClipboardList } from "lucide-react";
import type { ClassroomMessage, ClassroomAssignment } from "@/app/actions/classroom";
import type { ClassroomPeople } from "@/app/actions/classroom";
import type { FriendStatus } from "@/app/actions/friends";
import { LeaderboardRowFriendAction } from "@/components/leaderboard/LeaderboardRowFriendAction";
import { getLessonTitle } from "@/lib/curriculum";
import { formatDateTimeInBucharest } from "@/lib/bucharest-time";
import { SettingsCard } from "@/components/account/SettingsCard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { subtleFallbackAvatarBorderClass } from "@/components/ui/avatar-fallback";

type Tab = "people" | "announcements" | "assignments";

export function ClassroomViewStudent({
  people,
  messages,
  assignments,
  assignmentStatus,
  friendStatusByUserId = {},
  currentUserId,
}: {
  people: ClassroomPeople;
  messages: ClassroomMessage[];
  assignments: ClassroomAssignment[];
  assignmentStatus: { assignmentId: string; topicId: string; dueAt: string; completed: boolean }[];
  friendStatusByUserId?: Record<string, FriendStatus>;
  currentUserId?: string;
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
      <nav
        aria-label="Student classroom sections"
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

      {tab === "people" && (
        <SettingsCard className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">People</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">Your classroom community</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              See your teacher and classmates, then connect with friends directly.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/60">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Teacher</p>
            <div className="flex items-center gap-3">
              {people.teacher.avatarUrl ? (
                <Image
                  src={people.teacher.avatarUrl}
                  alt={`${people.teacher.username} avatar`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary ${subtleFallbackAvatarBorderClass}`}
                >
                  {people.teacher.username.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{people.teacher.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {people.teacher.rank} · Level {people.teacher.level}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Classmates</p>
          {people.students.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No other students in this class yet.
              </p>
          ) : (
            <ul className="space-y-3">
              {people.students.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-100"
                  >
                  <Link href={`/profile/${s.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                    {s.avatarUrl ? (
                      <Image
                        src={s.avatarUrl}
                        alt={`${s.username} avatar`}
                        width={40}
                        height={40}
                          className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                        <div
                          className={`h-10 w-10 shrink-0 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 flex items-center justify-center font-medium text-sm ${subtleFallbackAvatarBorderClass}`}
                        >
                        {s.username.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{s.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s.rank} · Level {s.level}</p>
                    </div>
                  </Link>
                  {currentUserId !== s.id && (
                    <LeaderboardRowFriendAction
                      userId={s.id}
                      username={s.username}
                      status={friendStatusByUserId[s.id] ?? "none"}
                    />
                  )}
                </li>
              ))}
            </ul>
            )}
          </div>
        </SettingsCard>
      )}

      {tab === "announcements" && (
        <SettingsCard className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Announcements</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">From your teacher</h2>
          </div>
          {messages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No announcements yet.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/60"
              >
                <p className="text-xs font-medium text-primary dark:text-primary/90 mb-1">
                  From your teacher, {people.teacher.username}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{m.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formatDateTimeInBucharest(m.createdAt)} (EET)
                </p>
              </div>
            ))
          )}
        </SettingsCard>
      )}

      {tab === "assignments" && (
        <SettingsCard className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Assignments</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">Your tasks</h2>
          </div>
          {assignments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No assignments yet.
            </p>
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
                    className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/60"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
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
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          completed
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : isPastDue
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        )}
                      >
                        {completed ? "Done" : isPastDue ? "Past due" : "Not done"}
                      </span>
                    </div>

                    {!completed ? (
                      <div className="mt-2">
                        <Link
                          href={`/learn/${a.topicId}`}
                          className="inline-flex min-h-11 items-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          Go to lesson
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </SettingsCard>
      )}
    </div>
  );
}
