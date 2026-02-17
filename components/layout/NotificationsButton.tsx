"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Bell, Send, PartyPopper, Check } from "lucide-react";
import type { NotificationItem } from "@/app/actions/nudge";
import { markNotificationDone } from "@/app/actions/nudge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatTime(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function isUnread(item: NotificationItem): boolean {
  return !("readAt" in item && item.readAt);
}

export function NotificationsButton({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [markingId, setMarkingId] = useState<string | null>(null);
  const unreadCount = notifications.filter(isUnread).length;

  async function handleMarkDone(e: React.MouseEvent, item: NotificationItem) {
    e.preventDefault();
    e.stopPropagation();
    if (markingId) return;
    setMarkingId(item.id);
    await markNotificationDone(item.type === "nudge" ? "nudge" : "congrats", item.id);
    setMarkingId(null);
    router.refresh();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          )}
          aria-label={unreadCount > 0 ? `${unreadCount} notifications` : "Notifications"}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[280px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No new notifications
            </div>
          ) : (
            notifications.map((item) => {
              const unread = isUnread(item);
              return item.type === "nudge" ? (
                <DropdownMenu.Item key={item.id} asChild>
                  <div
                    className={cn(
                      "flex items-start gap-2 px-4 py-3 outline-none hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-700/50 dark:focus:bg-gray-700/50",
                      item.readAt && "opacity-75"
                    )}
                  >
                    <Link
                      href={item.nextTopicId ? `/learn/${item.nextTopicId}` : "/learn"}
                      className="min-w-0 flex-1 flex gap-3"
                    >
                      <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 p-1.5">
                        <Send className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.teacherUsername} nudged you
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {item.lessonLabel}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTime(item.createdAt)}
                        </p>
                      </div>
                    </Link>
                    {unread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 h-8 px-2 text-xs gap-1"
                        onClick={(e) => handleMarkDone(e, item)}
                        disabled={markingId !== null}
                      >
                        <Check className="h-3 w-3" />
                        Done
                      </Button>
                    )}
                  </div>
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item key={item.id} asChild>
                  <div
                    className={cn(
                      "flex items-start gap-2 px-4 py-3 outline-none hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-700/50 dark:focus:bg-gray-700/50",
                      item.readAt && "opacity-75"
                    )}
                  >
                    <Link href="/dashboard" className="min-w-0 flex-1 flex gap-3">
                      <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-1.5">
                        <PartyPopper className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.teacherUsername} congratulated you
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTime(item.createdAt)}
                        </p>
                      </div>
                    </Link>
                    {unread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 h-8 px-2 text-xs gap-1"
                        onClick={(e) => handleMarkDone(e, item)}
                        disabled={markingId !== null}
                      >
                        <Check className="h-3 w-3" />
                        Done
                      </Button>
                    )}
                  </div>
                </DropdownMenu.Item>
              );
            })
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
