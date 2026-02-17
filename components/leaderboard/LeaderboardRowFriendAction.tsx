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
      <Link href={`/profile/${userId}`} className="text-sm font-medium text-primary hover:underline shrink-0">
        Friends
      </Link>
    );
  }
  if (status === "pending_sent") {
    return <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Pending</span>;
  }
  if (status === "pending_received") {
    return (
      <Link href="/profile/requests" className="text-sm text-primary hover:underline shrink-0">
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
