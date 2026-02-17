"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const profileNav = [
  { href: "/profile", label: "My profile", icon: User },
  { href: "/profile/friends", label: "Friends", icon: Users },
  { href: "/profile/requests", label: "Friend requests", icon: UserPlus },
];

/** True when viewing another user's profile (e.g. /profile/abc123 or /profile/abc123/friends). */
function isViewingOtherProfile(pathname: string): boolean {
  if (!pathname.startsWith("/profile/")) return false;
  if (pathname === "/profile/friends" || pathname === "/profile/requests") return false;
  return pathname !== "/profile";
}

/** When viewing another user, get their userId from path (e.g. /profile/abc123 or /profile/abc123/friends). */
function getViewedUserId(pathname: string): string | null {
  if (!isViewingOtherProfile(pathname)) return null;
  const segments = pathname.split("/").filter(Boolean);
  return segments[1] ?? null; // ['profile', userId] or ['profile', userId, 'friends']
}

const otherProfileNav = [
  { href: (id: string) => `/profile/${id}`, label: "Profile", icon: User },
  { href: (id: string) => `/profile/${id}/friends`, label: "Friends", icon: Users },
];

export function ProfileSubnav() {
  const pathname = usePathname();
  const viewedUserId = getViewedUserId(pathname);

  const navItems = viewedUserId
    ? otherProfileNav.map((item) => ({ ...item, href: item.href(viewedUserId) }))
    : profileNav;

  return (
    <nav className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
      {navItems.map((item) => {
        const href = typeof item.href === "function" ? item.href(viewedUserId!) : item.href;
        const label = item.label;
        const Icon = item.icon;
        const isActive =
          viewedUserId
            ? pathname === href
            : href === "/profile"
              ? pathname === "/profile"
              : pathname.startsWith(href + "/") || pathname === href;
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
