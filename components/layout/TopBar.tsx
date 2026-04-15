"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LayoutDashboard, LogOut, Settings2, ShieldCheck, UserCircle2 } from "lucide-react";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { RankBadge } from "@/components/ui/RankBadge";
import { HeartDisplay } from "@/components/ui/HeartDisplay";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import type { NotificationItem } from "@/app/actions/nudge";
import { signOutFromAppAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { subtleFallbackAvatarBorderClass } from "@/components/ui/avatar-fallback";

export function TopBar({
  notifications = [],
  primaryEmail,
  avatarUrl,
}: {
  notifications?: NotificationItem[];
  primaryEmail?: string;
  avatarUrl?: string | null;
}) {
  const signOutFormRef = useRef<HTMLFormElement>(null);

  return (
    <header
      data-tour-id="top-metrics"
      className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl dark:border-gray-700/80 dark:bg-gray-900/85"
    >
      <div className="flex min-h-[4rem] items-center gap-1.5 px-2 py-2 sm:px-3 md:min-h-16 md:gap-3 md:px-4 md:py-0">
        <div
          data-tour-id="top-metrics-summary"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-2"
        >
          <HeartDisplay compact />
          <StreakBadge compact />
          <RankBadge compact />
        </div>
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <NotificationsButton notifications={notifications} compact />
          <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 md:rounded-full md:px-2 md:py-1 md:text-xs"
                  title={primaryEmail ?? "Account"}
                >
                  {avatarUrl ? (
                    <span className="relative h-5 w-5 overflow-hidden rounded-full">
                      <Image src={avatarUrl} alt="Profile picture" fill sizes="24px" className="object-cover" />
                    </span>
                  ) : (
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary ${subtleFallbackAvatarBorderClass}`}
                    >
                      {(primaryEmail?.[0] ?? "?").toUpperCase()}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="w-[min(92vw,22rem)] rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{primaryEmail ?? "Unknown user"}</p>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/dashboard"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/profile"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/settings"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                      <Settings2 className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/settings/security"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Security
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <form ref={signOutFormRef} action={signOutFromAppAction} className="hidden" />
                  <DropdownMenu.Item
                    onSelect={(event) => {
                      event.preventDefault();
                      signOutFormRef.current?.requestSubmit();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </header>
  );
}
