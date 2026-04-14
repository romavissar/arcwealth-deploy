"use client";

import { useState } from "react";
import { getLessonTitle, LEVEL_NAMES } from "@/lib/curriculum";
import type { StudentProgress } from "@/app/actions/teacher";
import { nudgeStudent, congratulateStudent } from "@/app/actions/teacher";
import { SettingsCard } from "@/components/account/SettingsCard";
import { Button } from "@/components/ui/button";
import { Send, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherDashboardProps {
  students: StudentProgress[];
}

export function TeacherDashboard({ students }: TeacherDashboardProps) {
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [nudgedId, setNudgedId] = useState<string | null>(null);
  const [congratulatingId, setCongratulatingId] = useState<string | null>(null);
  const [congratulatedId, setCongratulatedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function handleNudge(s: StudentProgress) {
    if (nudgingId) return;
    setNudgingId(s.id);
    const res = await nudgeStudent(s.id);
    setNudgingId(null);
    if (res?.error) {
      setNotice({ tone: "error", text: res.error });
      return;
    }
    setNotice({ tone: "success", text: `Nudge sent to ${s.username}.` });
    setNudgedId(s.id);
    setTimeout(() => setNudgedId(null), 3000);
  }

  async function handleCongratulate(s: StudentProgress) {
    if (congratulatingId) return;
    setCongratulatingId(s.id);
    const res = await congratulateStudent(s.id);
    setCongratulatingId(null);
    if (res?.error) {
      setNotice({ tone: "error", text: res.error });
      return;
    }
    setNotice({ tone: "success", text: `Celebration sent to ${s.username}.` });
    setCongratulatedId(s.id);
    setTimeout(() => setCongratulatedId(null), 3000);
  }

  if (students.length === 0) {
    return (
      <SettingsCard>
        <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No students assigned yet. Ask an admin to assign students to you.
        </p>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
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
      {students.map((s) => (
        <SettingsCard key={s.id}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{s.username}</h2>
              {s.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.email}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {s.nextTopicId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNudge(s)}
                  disabled={!!nudgingId}
                  className="gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  {nudgingId === s.id ? "Sending…" : nudgedId === s.id ? "Nudge sent!" : "Nudge"}
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
            </div>
          </div>
          {s.nextTopicId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Next lesson: {getLessonTitle(s.nextTopicId)}
            </p>
          )}

          <div className="mb-4 grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total XP</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{s.xp}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Rank</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{s.rank}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{s.level}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
              <p className="text-base font-semibold text-amber-600 dark:text-amber-400">
                {s.streak_days} days
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learn progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {s.completedTopicCount} topic{s.completedTopicCount !== 1 ? "s" : ""} completed
                {s.completedLevels.length > 0 && (
                  <> · Levels completed: {s.completedLevels.map((l) => LEVEL_NAMES[l as keyof typeof LEVEL_NAMES] ?? l).join(", ")}</>
                )}
              </p>
              {s.last_activity_date ? (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Last active: {s.last_activity_date}</p>
              ) : null}
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
        </SettingsCard>
      ))}
    </div>
  );
}
