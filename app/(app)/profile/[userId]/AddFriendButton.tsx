"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendFriendRequest } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";
import type { FriendStatus } from "@/app/actions/friends";

export function AddFriendButton({
  targetUserId,
  initialStatus,
}: {
  targetUserId: string;
  initialStatus: FriendStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleSendRequest() {
    if (status !== "none") return;
    setLoading(true);
    const res = await sendFriendRequest(targetUserId);
    setLoading(false);
    if (res?.error) alert(res.error);
    else {
      setStatus("pending_sent");
      router.refresh();
    }
  }

  if (status === "friends") {
    return <span className="text-sm font-medium text-primary">Friends</span>;
  }
  if (status === "pending_sent") {
    return <span className="text-sm text-gray-500 dark:text-gray-400">Request sent</span>;
  }
  if (status === "pending_received") {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        They sent you a request — accept in Friend requests
      </span>
    );
  }

  return (
    <Button size="sm" onClick={handleSendRequest} disabled={loading}>
      {loading ? "Sending…" : "Add friend"}
    </Button>
  );
}
