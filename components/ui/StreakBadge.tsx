"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function StreakBadge() {
  const { isSignedIn } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setStreak(d.streak_days ?? 0))
      .catch(() => {});
  }, [isSignedIn]);

  return (
    <div className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-1 text-amber-800 dark:text-amber-200">
      <span className="text-lg">🔥</span>
      <span className="text-sm font-semibold">{streak}</span>
    </div>
  );
}
