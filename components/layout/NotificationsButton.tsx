"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Bell, Send, PartyPopper, Check, UserPlus, Users, ClipboardList, MessageSquare, Trash2, ChevronDown } from "lucide-react";
import type { NotificationItem } from "@/app/actions/nudge";
import { markNotificationAsRead, dismissNotification } from "@/app/actions/nudge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE = 5;

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
  const readAt = "readAt" in item ? item.readAt : null;
  return !readAt;
}

export function NotificationsButton({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const unreadCount = notifications.filter(isUnread).length;
  const visible = showAll ? notifications : notifications.slice(0, INITIAL_VISIBLE);
  const hasMore = notifications.length > INITIAL_VISIBLE && !showAll;

  async function handleMarkRead(e: React.MouseEvent, item: NotificationItem) {
    e.preventDefault();
    e.stopPropagation();
    if (actionKey) return;
    const key = `${item.type}:${item.id}`;
    setActionKey(key);
    await markNotificationAsRead(item.type, item.id);
    setActionKey(null);
    router.refresh();
  }

  async function handleDismiss(e: React.MouseEvent, item: NotificationItem) {
    e.preventDefault();
    e.stopPropagation();
    if (actionKey) return;
    const key = `${item.type}:${item.id}`;
    setActionKey(key);
    await dismissNotification(item.type, item.id);
    setActionKey(null);
    router.refresh();
  }

  function renderItem(item: NotificationItem) {
    const unread = isUnread(item);
    const read = !unread;
    const busy = actionKey === `${item.type}:${item.id}`;
    const baseClass = cn(
      "flex items-start gap-2 px-4 py-3 outline-none hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-700/50 dark:focus:bg-gray-700/50",
      read && "opacity-75"
    );

    const actionButtons = (
      <div className="flex shrink-0 gap-1">
        {unread && (
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs gap-1" onClick={(e) => handleMarkRead(e, item)} disabled={!!actionKey}>
            {busy ? "…" : <><Check className="h-3 w-3" /> Mark read</>}
          </Button>
        )}
        {read && (
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs gap-1 text-red-600 hover:text-red-700 dark:text-red-400" onClick={(e) => handleDismiss(e, item)} disabled={!!actionKey}>
            {busy ? "…" : <><Trash2 className="h-3 w-3" /> Delete</>}
          </Button>
        )}
      </div>
    );

    if (item.type === "nudge") {
      return (
        <DropdownMenu.Item key={item.id} asChild>
          <div className={baseClass}>
            <Link href={item.nextTopicId ? `/learn/${item.nextTopicId}` : "/learn"} className="min-w-0 flex-1 flex gap-3">
              <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 p-1.5">
                <Send className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.teacherUsername} nudged you</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.lessonLabel}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(item.createdAt)}</p>
              </div>
            </Link>
            {actionButtons}
          </div>
        </DropdownMenu.Item>
      );
    }
    if (item.type === "congrats") {
      return (
        <DropdownMenu.Item key={item.id} asChild>
          <div className={baseClass}>
            <Link href="/dashboard" className="min-w-0 flex-1 flex gap-3">
              <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-1.5">
                <PartyPopper className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.teacherUsername} congratulated you</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(item.createdAt)}</p>
              </div>
            </Link>
            {actionButtons}
          </div>
        </DropdownMenu.Item>
      );
    }
    if (item.type === "friend_request") {
      return (
        <DropdownMenu.Item key={item.id} asChild>
          <div className={baseClass}>
            <Link href="/profile/requests" className="min-w-0 flex-1 flex gap-3">
              <span className="shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 p-1.5">
                <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.fromUsername} sent you a friend request</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(item.createdAt)}</p>
              </div>
            </Link>
            {actionButtons}
          </div>
        </DropdownMenu.Item>
      );
    }
    if (item.type === "friend_accepted") {
      return (
        <DropdownMenu.Item key={item.id} asChild>
          <div className={baseClass}>
            <Link href={`/profile/${item.friendUserId}`} className="min-w-0 flex-1 flex gap-3">
              <span className="shrink-0 rounded-full bg-violet-100 dark:bg-violet-900/50 p-1.5">
                <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.friendUsername} accepted your friend request</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(item.createdAt)}</p>
              </div>
            </Link>
            {actionButtons}
          </div>
        </DropdownMenu.Item>
      );
    }
    if (item.type === "assignment") {
      return (
        <DropdownMenu.Item key={item.id} asChild>
          <div className={baseClass}>
            <Link href="/classroom" className="min-w-0 flex-1 flex gap-3">
              <span className="shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/50 p-1.5">
                <ClipboardList className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New assignment from {item.teacherUsername}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(item.createdAt)}</p>
              </div>
            </Link>
            {actionButtons}
          </div>
        </DropdownMenu.Item>
      );
    }
    if (item.type === "announcement") {
      return (
        <DropdownMenu.Item key={item.id} asChild>
          <div className={baseClass}>
            <Link href="/classroom" className="min-w-0 flex-1 flex gap-3">
              <span className="shrink-0 rounded-full bg-sky-100 dark:bg-sky-900/50 p-1.5">
                <MessageSquare className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Announcement from {item.teacherUsername}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.contentPreview}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(item.createdAt)}</p>
              </div>
            </Link>
            {actionButtons}
          </div>
        </DropdownMenu.Item>
      );
    }
    return null;
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
            <>
              {visible.map((item) => renderItem(item))}
              {hasMore && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="flex w-full items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Show more ({notifications.length - INITIAL_VISIBLE} older)
                  </button>
                </div>
              )}
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
