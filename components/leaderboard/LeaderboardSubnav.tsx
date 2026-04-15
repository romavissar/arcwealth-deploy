"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/leaderboard", label: "All Time", icon: Trophy },
  { href: "/leaderboard/weekly", label: "Weekly", icon: CalendarDays },
  { href: "/leaderboard/daily", label: "Daily", icon: Calendar },
];

export function LeaderboardSubnav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Leaderboard time filters" className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/leaderboard" ? pathname === "/leaderboard" : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-4 sm:text-sm",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
