import { createServiceClient } from "@/lib/supabase/server";

/** True if the stored username looks like a slug (not a full name). */
function looksLikeSlug(username: string | null): boolean {
  if (!username) return true;
  if (username === "user") return true;
  if (!username.includes(" ")) return true;
  if (username === username.toLowerCase()) return true;
  return false;
}

/**
 * Ensures a Clerk user has a row in user_profiles and user_progress.
 * Call from (app) layout or when loading profile so dev works without webhooks.
 * If profile exists with a slug-like username, updates it to Clerk's full name.
 */
export async function ensureUserInSupabase(userId: string, opts?: { username?: string; imageUrl?: string }) {
  const supabase = createServiceClient();
  const { data: existing } = await supabase.from("user_profiles").select("id, username").eq("id", userId).single();

  const displayName = opts?.username?.trim().slice(0, 50) || null;
  const suffix = Date.now().toString(36).slice(-6);
  const fullNameWithSuffix = displayName ? `${displayName}_${suffix}` : `user_${suffix}`;

  if (existing) {
    if (displayName && looksLikeSlug(existing.username)) {
      const { error: updateErr } = await supabase.from("user_profiles").update({
        username: displayName,
        ...(opts.imageUrl != null && { avatar_url: opts.imageUrl }),
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      if (updateErr && updateErr.code === "23505") {
        await supabase.from("user_profiles").update({
          username: fullNameWithSuffix,
          ...(opts.imageUrl != null && { avatar_url: opts.imageUrl }),
          updated_at: new Date().toISOString(),
        }).eq("id", userId);
      }
    }
    return;
  }

  const username = displayName || "user";
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: userId,
    username,
    avatar_url: opts?.imageUrl ?? null,
    rank: "novice",
  });
  if (profileError) {
    await supabase.from("user_profiles").insert({
      id: userId,
      username: fullNameWithSuffix,
      avatar_url: opts?.imageUrl ?? null,
      rank: "novice",
    });
  }
  const { data: topics } = await supabase.from("topics").select("topic_id").order("order_index");
  if (topics?.length) {
    const rows = topics.map((t) => ({
      user_id: userId,
      topic_id: t.topic_id,
      status: t.topic_id === "1.1.1" ? "available" : "locked",
    }));
    await supabase.from("user_progress").upsert(rows, {
      onConflict: "user_id,topic_id",
      ignoreDuplicates: true,
    });
  }
}
