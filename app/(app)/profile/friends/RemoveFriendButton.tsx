"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeFriend } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";

export function RemoveFriendButton({ friendUserId }: { friendUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm("Remove this friend?")) return;
    setLoading(true);
    const res = await removeFriend(friendUserId);
    setLoading(false);
    if (res?.error) alert(res.error);
    else router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRemove} disabled={loading}>
      {loading ? "Removing…" : "Remove"}
    </Button>
  );
}
