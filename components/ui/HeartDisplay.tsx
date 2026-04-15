"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { REGEN_SECONDS } from "@/lib/hearts";

function formatCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return "0:00";
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function HeartDisplay({ compact = false }: { compact?: boolean }) {
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
    refetchProfile();
  }, [refetchProfile]);

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
    <div
      className={`inline-flex items-center rounded-xl border border-rose-300/80 bg-rose-50 font-semibold text-rose-800 dark:border-rose-700/70 dark:bg-rose-900/30 dark:text-rose-200 ${
        compact ? "gap-1.5 px-2 py-1 text-xs" : "gap-2 px-2.5 py-1.5 text-sm"
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-md bg-rose-500/15 dark:bg-rose-400/20 ${
          compact ? "h-5 w-5" : "h-6 w-6"
        }`}
      >
        <Heart className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} text-rose-600 dark:text-rose-300`} aria-hidden="true" />
      </span>
      <span className="tabular-nums">{hearts}</span>
      {countdown !== null && (
        <span className="max-w-16 truncate text-[11px] text-rose-700/90 tabular-nums dark:text-rose-200/90 sm:max-w-none">
          {compact ? `+1 ${countdown}` : `+1 in ${countdown}`}
        </span>
      )}
    </div>
  );
}
