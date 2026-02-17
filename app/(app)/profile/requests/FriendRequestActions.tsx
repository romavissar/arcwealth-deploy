"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} from "@/app/actions/friends";
import { Button } from "@/components/ui/button";

export function FriendRequestActions({
  requestId,
  direction,
}: {
  requestId: string;
  direction: "incoming" | "outgoing";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    const res = await acceptFriendRequest(requestId);
    setLoading(false);
    if (res?.error) alert(res.error);
    else router.refresh();
  }

  async function handleDecline() {
    setLoading(true);
    const res = await declineFriendRequest(requestId);
    setLoading(false);
    if (res?.error) alert(res.error);
    else router.refresh();
  }

  async function handleCancel() {
    setLoading(true);
    const res = await cancelFriendRequest(requestId);
    setLoading(false);
    if (res?.error) alert(res.error);
    else router.refresh();
  }

  if (direction === "incoming") {
    return (
      <div className="flex gap-2 shrink-0">
        <Button size="sm" onClick={handleAccept} disabled={loading}>
          {loading ? "…" : "Accept"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDecline} disabled={loading}>
          Decline
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
      {loading ? "…" : "Cancel request"}
    </Button>
  );
}
