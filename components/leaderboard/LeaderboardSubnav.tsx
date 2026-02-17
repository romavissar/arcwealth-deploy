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
    <nav className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/leaderboard" ? pathname === "/leaderboard" : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
