"use client";

import { useState } from "react";
import { LEVEL_NAMES, LESSON_TITLES } from "@/lib/curriculum";
import type { StudentProgress } from "@/app/actions/teacher";
import { nudgeStudent, congratulateStudent } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { Send, PartyPopper } from "lucide-react";

interface TeacherDashboardProps {
  students: StudentProgress[];
}

export function TeacherDashboard({ students }: TeacherDashboardProps) {
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [nudgedId, setNudgedId] = useState<string | null>(null);
  const [congratulatingId, setCongratulatingId] = useState<string | null>(null);
  const [congratulatedId, setCongratulatedId] = useState<string | null>(null);

  async function handleNudge(s: StudentProgress) {
    if (nudgingId) return;
    setNudgingId(s.id);
    const res = await nudgeStudent(s.id);
    setNudgingId(null);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setNudgedId(s.id);
    setTimeout(() => setNudgedId(null), 3000);
  }

  async function handleCongratulate(s: StudentProgress) {
    if (congratulatingId) return;
    setCongratulatingId(s.id);
    const res = await congratulateStudent(s.id);
    setCongratulatingId(null);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setCongratulatedId(s.id);
    setTimeout(() => setCongratulatedId(null), 3000);
  }

  if (students.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No students assigned yet. Ask an admin to assign students to you.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {students.map((s) => (
        <div
          key={s.id}
          className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{s.username}</h2>
              {s.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.email}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
            {s.nextTopicId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleNudge(s)}
                disabled={!!nudgingId}
                className="gap-1.5"
              >
                <Send className="h-4 w-4" />
                {nudgingId === s.id ? "Sending…" : nudgedId === s.id ? "Nudge sent!" : "Nudge to next lesson"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCongratulate(s)}
              disabled={!!congratulatingId}
              className="gap-1.5"
            >
              <PartyPopper className="h-4 w-4" />
              {congratulatingId === s.id ? "Sending…" : congratulatedId === s.id ? "Sent!" : "Congratulate"}
            </Button>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-medium text-primary">{s.xp} XP</span>
              <span className="text-gray-600 dark:text-gray-300">Rank: {s.rank}</span>
              <span className="text-gray-600 dark:text-gray-300">Level {s.level}</span>
              <span className="text-amber-600 dark:text-amber-400">🔥 {s.streak_days} day streak</span>
              {s.last_activity_date && (
                <span className="text-gray-500">Last active: {s.last_activity_date}</span>
              )}
            </div>
            </div>
          </div>
          {s.nextTopicId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Next lesson: {LESSON_TITLES[s.nextTopicId] ?? s.nextTopicId}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learn progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {s.completedTopicCount} topic{s.completedTopicCount !== 1 ? "s" : ""} completed
                {s.completedLevels.length > 0 && (
                  <> · Levels completed: {s.completedLevels.map((l) => LEVEL_NAMES[l as keyof typeof LEVEL_NAMES] ?? l).join(", ")}</>
                )}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {s.achievements.length === 0 ? (
                  <span className="text-sm text-gray-500">None yet</span>
                ) : (
                  s.achievements.map((a) => (
                    <span
                      key={a.slug}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs"
                      title={a.title}
                    >
                      <span>{a.icon}</span>
                      <span>{a.title}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
