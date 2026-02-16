"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getLevelFromXP, getXPProgressToNextLevel } from "@/lib/xp";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function XPBar() {
  const { isSignedIn } = useAuth();
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setXp(d.xp ?? 0))
      .catch(() => {});
  }, [isSignedIn]);

  const { percentage, current, required } = getXPProgressToNextLevel(xp);
  const level = getLevelFromXP(xp);

  return (
    <div className={cn("flex items-center gap-2 min-w-[120px] max-w-[200px]")}>
      <span className="text-xs font-medium text-gray-500">Lvl {level}</span>
      <Progress value={percentage} className="h-2 flex-1" />
      <span className="text-xs text-gray-400">{current}/{required}</span>
    </div>
  );
}
