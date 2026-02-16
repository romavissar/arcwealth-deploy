import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { applyRegeneration } from "@/lib/hearts";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("xp, streak_days, hearts, last_hearts_at, max_hearts, level, rank")
    .eq("id", userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const fallback = { xp: 0, streak_days: 0, hearts: 5, level: 1, rank: "novice" as const };
  const row = data ?? fallback;
  const currentHearts = row.hearts ?? 5;
  const maxHearts = row.max_hearts ?? 5;
  const { hearts: regeneratedHearts, lastHeartsAt } = applyRegeneration(
    currentHearts,
    row.last_hearts_at ?? null,
    maxHearts
  );

  const effectiveLastHeartsAt = regeneratedHearts !== currentHearts ? lastHeartsAt : (row.last_hearts_at ?? lastHeartsAt);
  if (regeneratedHearts !== currentHearts) {
    await supabase
      .from("user_profiles")
      .update({ hearts: regeneratedHearts, last_hearts_at: lastHeartsAt, updated_at: lastHeartsAt })
      .eq("id", userId);
  }

  return NextResponse.json({
    xp: row.xp ?? fallback.xp,
    streak_days: row.streak_days ?? fallback.streak_days,
    hearts: regeneratedHearts,
    max_hearts: maxHearts,
    last_hearts_at: effectiveLastHeartsAt,
    level: row.level ?? fallback.level,
    rank: row.rank ?? fallback.rank,
  });
}
