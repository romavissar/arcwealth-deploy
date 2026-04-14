"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendFriendRequest } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";
import type { FriendStatus } from "@/app/actions/friends";

export function LeaderboardRowFriendAction({
  userId,
  username,
  status,
}: {
  userId: string;
  username: string;
  status: FriendStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSendRequest() {
    if (status !== "none") return;
    setLoading(true);
    const res = await sendFriendRequest(userId);
    setLoading(false);
    if (res?.error) alert(res.error);
    else router.refresh();
  }

  if (status === "friends") {
    return (
      <Link
        href={`/profile/${userId}`}
        className="shrink-0 rounded-md text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        Friends
      </Link>
    );
  }
  if (status === "pending_sent") {
    return (
      <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Pending
      </span>
    );
  }
  if (status === "pending_received") {
    return (
      <Link
        href="/profile/requests"
        className="shrink-0 rounded-md text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        Accept request
      </Link>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={handleSendRequest} disabled={loading} className="shrink-0">
      {loading ? "…" : "Add friend"}
    </Button>
  );
}
