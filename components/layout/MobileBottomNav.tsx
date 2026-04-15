"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BookText,
  GraduationCap,
  LayoutDashboard,
  ListOrdered,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryTabs: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/textbook", label: "Textbook", icon: BookText },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: ListOrdered },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/90 bg-white/95 px-2 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur dark:border-gray-700/90 dark:bg-gray-900/95 md:hidden"
    >
      <div className="mx-auto grid w-full max-w-xl grid-flow-col auto-cols-fr gap-1.5">
        {primaryTabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex w-full min-h-11 items-center justify-center rounded-xl px-0.5 py-1 transition-colors",
                active
                  ? "bg-primary/12 text-primary dark:bg-primary/25"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              )}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
