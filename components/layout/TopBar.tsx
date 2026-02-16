"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { XPBar } from "@/components/ui/XPBar";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { RankBadge } from "@/components/ui/RankBadge";
import { HeartDisplay } from "@/components/ui/HeartDisplay";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <StreakBadge />
          <RankBadge />
          <XPBar />
        </div>
        <div className="flex items-center gap-2">
          <HeartDisplay />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
