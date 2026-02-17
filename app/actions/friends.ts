"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";

export type FriendStatus = "friends" | "pending_sent" | "pending_received" | "none";

export type PublicProfile = {
  id: string;
  username: string;
  avatarUrl: string | null;
  rank: string;
  level: number;
  xp: number;
  streakDays: number;
  completedTopicCount: number;
  achievementCount: number;
};

export type FriendRow = {
  id: string;
  username: string;
  avatarUrl: string | null;
  rank: string;
  level: number;
};

export type FriendRequestRow = {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  /** For incoming: who sent the request. For outgoing: who received (the person I requested). */
  otherUserId: string;
  otherUsername: string;
  otherAvatarUrl: string | null;
};

/** True if user is in student_teacher (eligible for friends system). */
async function isStudent(supabase: ReturnType<typeof createServiceClient>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("student_user_id", userId)
    .maybeSingle();
  return !!data;
}

/** Get friend status between current user and a list of other user ids. */
export async function getFriendStatusForUsers(
  otherUserIds: string[]
): Promise<{ error?: string; statusByUserId?: Record<string, FriendStatus> }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  const supabase = createServiceClient();
  const statusByUserId: Record<string, FriendStatus> = {};
  const uniq = [...new Set(otherUserIds)].filter((id) => id !== userId);
  if (uniq.length === 0) return { statusByUserId: {} };

  const [friendsRows, sentRows, receivedRows] = await Promise.all([
    supabase.from("friends").select("user_id_1, user_id_2"),
    supabase.from("friend_requests").select("to_user_id").eq("from_user_id", userId).eq("status", "pending"),
    supabase.from("friend_requests").select("from_user_id").eq("to_user_id", userId).eq("status", "pending"),
  ]);

  for (const id of uniq) statusByUserId[id] = "none";

  for (const r of friendsRows.data ?? []) {
    const other = r.user_id_1 === userId ? r.user_id_2 : r.user_id_1;
    if (uniq.includes(other)) statusByUserId[other] = "friends";
  }
  for (const r of sentRows.data ?? []) {
    if (uniq.includes(r.to_user_id)) statusByUserId[r.to_user_id] = "pending_sent";
  }
  for (const r of receivedRows.data ?? []) {
    if (uniq.includes(r.from_user_id)) statusByUserId[r.from_user_id] = "pending_received";
  }

  return { statusByUserId };
}

/** Send a friend request. Only students; cannot send to self or duplicate. */
export async function sendFriendRequest(toUserId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };
  if (toUserId === userId) return { error: "Cannot send request to yourself" };

  const supabase = createServiceClient();
  const [senderIsStudent, receiverIsStudent] = await Promise.all([
    isStudent(supabase, userId),
    isStudent(supabase, toUserId),
  ]);
  if (!senderIsStudent) return { error: "Only students can send friend requests" };
  if (!receiverIsStudent) return { error: "You can only send requests to other students" };

  const { statusByUserId } = await getFriendStatusForUsers([toUserId]);
  const status = statusByUserId?.[toUserId] ?? "none";
  if (status === "friends") return { error: "Already friends" };
  if (status === "pending_sent") return { error: "Request already sent" };
  if (status === "pending_received") {
    return { error: "They already sent you a request. Accept it from Friend requests." };
  }

  const { error } = await supabase.from("friend_requests").insert({
    from_user_id: userId,
    to_user_id: toUserId,
    status: "pending",
  });
  if (error) {
    if (error.code === "23505") {
      await supabase.from("friend_requests").delete().eq("from_user_id", userId).eq("to_user_id", toUserId);
      await supabase.from("friend_requests").delete().eq("from_user_id", toUserId).eq("to_user_id", userId);
      const { error: retryErr } = await supabase.from("friend_requests").insert({
        from_user_id: userId,
        to_user_id: toUserId,
        status: "pending",
      });
      if (retryErr) return { error: retryErr.message };
      return {};
    }
    return { error: error.message };
  }
  return {};
}

/** Accept a friend request. Only the recipient can accept. */
export async function acceptFriendRequest(requestId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const { data: req, error: fetchErr } = await supabase
    .from("friend_requests")
    .select("id, from_user_id, to_user_id")
    .eq("id", requestId)
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .single();
  if (fetchErr || !req) return { error: "Request not found or already handled" };

  const [u1, u2] = req.from_user_id < req.to_user_id ? [req.from_user_id, req.to_user_id] : [req.to_user_id, req.from_user_id];
  const { error: insertErr } = await supabase.from("friends").insert({ user_id_1: u1, user_id_2: u2 });
  if (insertErr) return { error: insertErr.message };

  await supabase.from("friend_requests").delete().eq("id", requestId);
  return {};
}

/** Decline a friend request. Only the recipient can decline. */
export async function declineFriendRequest(requestId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const { data: req } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("id", requestId)
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .single();
  if (!req) return { error: "Request not found or already handled" };

  await supabase.from("friend_requests").update({ status: "declined" }).eq("id", requestId);
  return {};
}

/** Cancel an outgoing friend request. Only the sender can cancel. */
export async function cancelFriendRequest(requestId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const { data: req } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("id", requestId)
    .eq("from_user_id", userId)
    .eq("status", "pending")
    .single();
  if (!req) return { error: "Request not found or already handled" };

  await supabase.from("friend_requests").delete().eq("id", requestId);
  return {};
}

/** Remove a friend. Either friend can remove. */
export async function removeFriend(otherUserId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const [u1, u2] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
  const { error } = await supabase.from("friends").delete().eq("user_id_1", u1).eq("user_id_2", u2);
  if (error) return { error: error.message };
  return {};
}

/** List another user's friends (for public profile view). Only if canViewProfile(targetUserId). */
export async function getPublicFriends(targetUserId: string): Promise<{ error?: string; friends?: FriendRow[] }> {
  const ok = await canViewProfile(targetUserId);
  if (!ok) return { error: "Forbidden" };

  const supabase = createServiceClient();
  const { data: rows } = await supabase.from("friends").select("user_id_1, user_id_2").or(`user_id_1.eq.${targetUserId},user_id_2.eq.${targetUserId}`);
  const friendIds = (rows ?? []).map((r) => (r.user_id_1 === targetUserId ? r.user_id_2 : r.user_id_1));
  if (friendIds.length === 0) return { friends: [] };

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url, rank, level")
    .in("id", friendIds);

  const friends: FriendRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username ?? "?",
    avatarUrl: p.avatar_url ?? null,
    rank: p.rank ?? "novice",
    level: p.level ?? 1,
  }));
  friends.sort((a, b) => a.username.localeCompare(b.username));
  return { friends };
}

/** List current user's friends with profile info. Only the signed-in user's data. */
export async function getFriends(): Promise<{ error?: string; friends?: FriendRow[] }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const { data: rows } = await supabase.from("friends").select("user_id_1, user_id_2").or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
  const friendIds = (rows ?? []).map((r) => (r.user_id_1 === userId ? r.user_id_2 : r.user_id_1));
  if (friendIds.length === 0) return { friends: [] };

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url, rank, level")
    .in("id", friendIds);

  const friends: FriendRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username ?? "?",
    avatarUrl: p.avatar_url ?? null,
    rank: p.rank ?? "novice",
    level: p.level ?? 1,
  }));
  friends.sort((a, b) => a.username.localeCompare(b.username));
  return { friends };
}

/** List incoming and outgoing pending friend requests for the current user only. Other users cannot see this data. */
export async function getFriendRequests(): Promise<{
  error?: string;
  incoming?: FriendRequestRow[];
  outgoing?: FriendRequestRow[];
}> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createServiceClient();
  const [incomingRes, outgoingRes] = await Promise.all([
    supabase
      .from("friend_requests")
      .select("id, from_user_id, to_user_id, created_at")
      .eq("to_user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("friend_requests")
      .select("id, from_user_id, to_user_id, created_at")
      .eq("from_user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const fromIds = [...new Set([
    ...(incomingRes.data ?? []).map((r) => r.from_user_id),
    ...(outgoingRes.data ?? []).map((r) => r.to_user_id),
  ])];
  const { data: profiles } = fromIds.length
    ? await supabase.from("user_profiles").select("id, username, avatar_url").in("id", fromIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const incoming: FriendRequestRow[] = (incomingRes.data ?? []).map((r) => {
    const p = profileMap.get(r.from_user_id);
    return {
      id: r.id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      createdAt: r.created_at,
      otherUserId: r.from_user_id,
      otherUsername: p?.username ?? "?",
      otherAvatarUrl: p?.avatar_url ?? null,
    };
  });
  const outgoing: FriendRequestRow[] = (outgoingRes.data ?? []).map((r) => {
    const p = profileMap.get(r.to_user_id);
    return {
      id: r.id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      createdAt: r.created_at,
      otherUserId: r.to_user_id,
      otherUsername: p?.username ?? "?",
      otherAvatarUrl: p?.avatar_url ?? null,
    };
  });

  return { incoming, outgoing };
}

/** Can the current user view targetUserId's profile? Students can view students; teachers/admins can view students. */
export async function canViewProfile(targetUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  if (userId === targetUserId) return true;

  const supabase = createServiceClient();
  const { data: targetInStudentTeacher } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("student_user_id", targetUserId)
    .maybeSingle();
  const targetIsStudent = !!targetInStudentTeacher;

  const { data: viewerInStudentTeacher } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("student_user_id", userId)
    .maybeSingle();
  const { data: viewerInTeacherList } = await supabase
    .from("teacher_list")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  const viewerIsStudent = !!viewerInStudentTeacher;
  const viewerIsTeacherOrAdmin = !!viewerInTeacherList;
  const { isAdmin } = await import("@/lib/roles");
  const viewerIsAdmin = await isAdmin();

  if (targetIsStudent && (viewerIsStudent || viewerIsTeacherOrAdmin || viewerIsAdmin)) return true;
  return false;
}

/** Get public profile for a user. Caller must be allowed to view (use canViewProfile first). */
export async function getPublicProfile(targetUserId: string): Promise<{
  error?: string;
  profile?: PublicProfile;
}> {
  const ok = await canViewProfile(targetUserId);
  if (!ok) return { error: "Forbidden" };

  const supabase = createServiceClient();
  const { data: p, error } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url, rank, level, xp, streak_days")
    .eq("id", targetUserId)
    .single();
  if (error || !p) return { error: error?.message ?? "Profile not found" };

  const { count: completedCount } = await supabase
    .from("user_progress")
    .select("topic_id", { count: "exact", head: true })
    .eq("user_id", targetUserId)
    .eq("status", "completed");
  const { count: achCount } = await supabase
    .from("user_achievements")
    .select("achievement_slug", { count: "exact", head: true })
    .eq("user_id", targetUserId);

  return {
    profile: {
      id: p.id,
      username: p.username ?? "?",
      avatarUrl: p.avatar_url ?? null,
      rank: p.rank ?? "novice",
      level: p.level ?? 1,
      xp: p.xp ?? 0,
      streakDays: p.streak_days ?? 0,
      completedTopicCount: completedCount ?? 0,
      achievementCount: achCount ?? 0,
    },
  };
}
