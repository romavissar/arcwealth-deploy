"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Trophy, GraduationCap, ListOrdered, BookText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/textbook", label: "Textbook", icon: BookText },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: ListOrdered },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 w-56 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 p-4">
      <Link href="/dashboard" className="font-bold text-xl text-primary mb-6">
        ArcWealth
      </Link>
      <nav className="flex flex-col gap-1 flex-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary/10 text-primary dark:bg-primary/20"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href="/settings"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mt-auto",
          pathname === "/settings" || pathname.startsWith("/settings/")
            ? "bg-primary/10 text-primary dark:bg-primary/20"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        )}
      >
        <Settings className="h-5 w-5" />
        Settings
      </Link>
    </aside>
  );
}
