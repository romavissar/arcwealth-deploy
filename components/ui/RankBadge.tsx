"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getRankBySlug } from "@/lib/ranks";

export function RankBadge() {
  const { isSignedIn } = useAuth();
  const [rankSlug, setRankSlug] = useState<string>("novice");

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setRankSlug(d.rank ?? "novice"))
      .catch(() => {});
  }, [isSignedIn]);

  const rank = getRankBySlug(rankSlug);

  return (
    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold ${rank?.color ?? "bg-gray-100 text-gray-800"}`}>
      <span className="text-lg">{rank?.icon ?? "🌱"}</span>
      <span>{rank?.title ?? "Novice"}</span>
    </div>
  );
}
