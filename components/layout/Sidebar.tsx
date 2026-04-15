"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Trophy, Route, ListOrdered, BookText, Settings, Shield, School, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Journey", icon: Route },
  { href: "/textbook", label: "Textbook", icon: BookText },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: ListOrdered },
];

const ADMIN_EMAIL = "romavissar@gmail.com";

type UserRole = "admin" | "teacher" | "student" | "user" | null;

const navItemClass =
  "group relative flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 motion-reduce:transition-none";

const activeNavItemClass = "bg-primary/10 text-primary shadow-sm shadow-primary/10 dark:bg-primary/20";
const inactiveNavItemClass =
  "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100";

function SidebarLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(navItemClass, isActive ? activeNavItemClass : inactiveNavItemClass)}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-200 motion-reduce:transition-none",
          isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 group-hover:opacity-50 group-hover:scale-y-75"
        )}
      />
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 motion-reduce:transition-none",
          isActive
            ? "bg-primary/15 text-primary dark:bg-primary/25"
            : "bg-slate-100/80 text-slate-500 group-hover:-translate-y-0.5 group-hover:scale-[1.03] group-hover:bg-slate-200 group-hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-100"
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({ userRole, primaryEmail }: { userRole?: UserRole; primaryEmail?: string }) {
  const pathname = usePathname();
  const isAdminUser = userRole === "admin" || primaryEmail?.toLowerCase() === ADMIN_EMAIL;
  const showTeacher = userRole === "teacher" || userRole === "admin";
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 w-56 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 p-4">
      <Link href="/dashboard" className="font-bold text-xl text-primary mb-6">
        ArcWealth
      </Link>
      <nav className="flex flex-col gap-0 flex-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <span key={href} className="contents">
            {href === "/profile" && (isAdminUser || showTeacher || userRole === "student") && (
              <SidebarLink
                href={isAdminUser ? "/admin/classrooms" : "/classroom"}
                label="Classroom"
                icon={School}
                isActive={
                  isAdminUser ? pathname.startsWith("/admin/classrooms") : pathname === "/classroom" || pathname.startsWith("/classroom/")
                }
              />
            )}
            <SidebarLink
              href={href}
              label={label}
              icon={Icon}
              isActive={pathname === href || pathname.startsWith(href + "/")}
            />
          </span>
        ))}
        {isAdminUser && (
          <SidebarLink
            href="/admin"
            label="Admin"
            icon={Shield}
            isActive={pathname === "/admin" && !pathname.startsWith("/admin/classrooms")}
          />
        )}
      </nav>
      <SidebarLink
        href="/settings"
        label="Settings"
        icon={Settings}
        isActive={pathname === "/settings" || pathname.startsWith("/settings/")}
      />
    </aside>
  );
}
