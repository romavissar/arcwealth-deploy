import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getXPProgressToNextLevel } from "@/lib/xp";
import { getRankBySlug } from "@/lib/ranks";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServiceClient();
  const [profileRes, progressRes] = await Promise.all([
    supabase.from("user_profiles").select("xp, streak_days, rank, level").eq("id", userId).single(),
    supabase.from("user_progress").select("topic_id, status").eq("user_id", userId).order("topic_id"),
  ]);

  const profile = profileRes.data;
  const progress = progressRes.data ?? [];
  const xp = profile?.xp ?? 0;
  const { percentage, current: xpInLevel, required: xpToNextLevel } = getXPProgressToNextLevel(xp);
  const rank = profile ? getRankBySlug(profile.rank ?? "novice") : null;
  const inProgressTopic = progress.find((p) => p.status === "in_progress");
  const continueTopic = progress.find((p) => p.status === "available" || p.status === "in_progress");
  const currentTopicId = inProgressTopic?.topic_id ?? continueTopic?.topic_id ?? "1.1.1";
  const nextTopicId = continueTopic?.topic_id ?? "1.1.1";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{profile ? `!` : ""}
        </h1>
        <p className="text-gray-500 mt-1">
          Keep building your money skills.
        </p>
      </div>

      {/* Current topic, level, XP, streak, rank */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Your progress</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Topic</p>
            <p className="text-lg font-semibold text-gray-900 font-mono">{currentTopicId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Level</p>
            <p className="text-lg font-semibold text-gray-900">{profile?.level ?? 1}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">All-time XP</p>
            <p className="text-lg font-semibold text-gray-900">{xp}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Streak</p>
            <p className="text-lg font-semibold text-gray-900">
              <span className="text-amber-600">🔥</span> {profile?.streak_days ?? 0} day{profile?.streak_days !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rank</p>
            <p className="text-lg font-semibold text-gray-900">
              <span>{rank?.icon ?? "🌱"}</span> {rank?.title ?? "Novice"}
            </p>
          </div>
        </div>
      </div>

      {/* XP progress to next level */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500 mb-2">XP progress to next level</h2>
        {profile ? (
          <>
            <Progress value={percentage} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              Level {profile.level} · {xpInLevel}/{xpToNextLevel} XP in this level · {xp} XP total
            </p>
          </>
        ) : (
          <Skeleton className="h-3 w-full mb-2" />
        )}
      </div>

      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-8 text-center">
        <p className="text-gray-600 mb-4">Pick up where you left off</p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link href={continueTopic ? `/learn/${nextTopicId}` : "/learn"}>
            Continue Learning
          </Link>
        </Button>
      </div>
    </div>
  );
}
