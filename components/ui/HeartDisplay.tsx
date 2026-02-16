"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { REGEN_SECONDS } from "@/lib/hearts";

function formatCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return "0:00";
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function HeartDisplay() {
  const { isSignedIn } = useAuth();
  const [hearts, setHearts] = useState(5);
  const [maxHearts, setMaxHearts] = useState(5);
  const [lastHeartsAt, setLastHeartsAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const prevSecondsLeftRef = useRef<number | null>(null);

  const refetchProfile = useCallback(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setHearts(d.hearts ?? 5);
        setMaxHearts(d.max_hearts ?? 5);
        setLastHeartsAt(d.last_hearts_at ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    refetchProfile();
  }, [isSignedIn, refetchProfile]);

  useEffect(() => {
    prevSecondsLeftRef.current = null;
    if (hearts >= maxHearts || !lastHeartsAt) {
      setCountdown(null);
      return;
    }
    const periodMs = REGEN_SECONDS * 1000;
    const intervalMs = 1000;
    const update = () => {
      const last = new Date(lastHeartsAt).getTime();
      const elapsed = Date.now() - last;
      const nextInMs = periodMs - (elapsed % periodMs);
      const secondsLeft = nextInMs <= 0 ? 0 : Math.ceil(nextInMs / 1000);
      setCountdown(formatCountdown(secondsLeft));

      const prev = prevSecondsLeftRef.current;
      prevSecondsLeftRef.current = secondsLeft;
      const justWrapped = prev !== null && prev <= 1 && secondsLeft >= REGEN_SECONDS - 1;
      if (justWrapped) {
        setHearts((h) => Math.min(h + 1, maxHearts));
        setLastHeartsAt(new Date().toISOString());
        refetchProfile();
      }
    };
    update();
    const id = setInterval(update, intervalMs);
    return () => clearInterval(id);
  }, [hearts, maxHearts, lastHeartsAt, refetchProfile]);

  return (
    <div className="flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-900/40 px-2 py-1 text-red-800 dark:text-red-200">
      <span className="text-lg">❤️</span>
      <span className="text-sm font-semibold">{hearts}</span>
      {countdown !== null && (
        <span className="text-xs text-red-600 dark:text-red-300 tabular-nums">+1 in {countdown}</span>
      )}
    </div>
  );
}
