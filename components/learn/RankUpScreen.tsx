"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Rank } from "@/lib/ranks";

interface RankUpScreenProps {
  previousRank: Rank;
  newRank: Rank;
  xpEarned: number;
  totalXP: number;
  userLevel: number;
  onContinue: () => void;
}

export function RankUpScreen({
  previousRank,
  newRank,
  xpEarned,
  totalXP,
  userLevel,
  onContinue,
}: RankUpScreenProps) {
  useEffect(() => {
    const run = async () => {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };
    run();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-white to-primary/10 z-50 p-6">
      <div className="rounded-2xl bg-white shadow-2xl border border-gray-200 p-10 max-w-md w-full text-center">
        <p className="text-5xl mb-4">{newRank.icon}</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rank Up!</h2>
        <p className="text-lg font-semibold text-primary mb-2">{newRank.title}</p>
        <p className="text-gray-600 mb-6">{newRank.description}</p>
        <p className="text-sm text-gray-500 mb-8">
          +{xpEarned} XP · Level {userLevel}
        </p>
        <Button size="lg" className="w-full" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
