"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function HeartDisplay() {
  const { isSignedIn } = useAuth();
  const [hearts, setHearts] = useState(5);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setHearts(d.hearts ?? 5);
      })
      .catch(() => {});
  }, [isSignedIn]);

  return (
    <div className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-red-800">
      <span className="text-lg">❤️</span>
      <span className="text-sm font-semibold">{hearts}</span>
    </div>
  );
}
