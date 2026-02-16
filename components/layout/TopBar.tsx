"use client";

import { UserButton } from "@clerk/nextjs";
import { XPBar } from "@/components/ui/XPBar";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { RankBadge } from "@/components/ui/RankBadge";
import { HeartDisplay } from "@/components/ui/HeartDisplay";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
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
            userProfileUrl="/settings"
            userProfileMode="navigation"
            appearance={{
              baseTheme: undefined,
              variables: {
                borderRadius: "0.75rem",
                colorBackground: "transparent",
                colorInputBackground: "transparent",
                colorText: "rgb(17 24 39)",
                colorTextSecondary: "rgb(75 85 99)",
              },
              elements: {
                avatarBox: "h-8 w-8",
                userButtonPopoverFooter: "hidden",
                userButtonPopoverCard: "font-sans w-max max-w-[16rem] min-w-0 shadow-xl rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800",
                userButtonPopoverMain: "font-sans text-gray-900 dark:text-gray-100 [&_*]:dark:text-gray-100",
                userButtonPopoverActionButton: "font-sans text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
                userButtonOuterIdentifier: "font-sans text-gray-900 dark:text-gray-100",
                userButtonPopoverActionButtonIconBox: "text-gray-600 dark:text-gray-300",
                userButtonPopoverActionButtonIcon: "h-5 w-5 shrink-0",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
