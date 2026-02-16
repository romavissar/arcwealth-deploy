import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getXPProgressToNextLevel } from "@/lib/xp";
import { getRankBySlug } from "@/lib/ranks";
import { Progress } from "@/components/ui/progress";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, supabaseResult] = await Promise.all([
    currentUser(),
    (async () => {
      const supabase = createServiceClient();
      return supabase.from("user_profiles").select("*").eq("id", userId).single();
    })(),
  ]);
  const { data: profile } = supabaseResult;
  if (!profile) redirect("/sign-in");

  const { percentage } = getXPProgressToNextLevel(profile.xp);
  const rank = getRankBySlug(profile.rank) ?? getRankBySlug("novice");
  const avatarUrl = clerkUser?.imageUrl ?? profile.avatar_url ?? null;
  const rankClass = rank ? `${rank.color} ${rank.darkColor ?? "dark:bg-gray-700 dark:text-gray-200"}` : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-24 w-24 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={96} height={96} className="object-cover w-full h-full" />
          ) : (
            <span>{profile.username?.[0] ?? "?"}</span>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.username}</h1>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${rankClass}`}>
            {rank?.icon} {rank?.title ?? profile.rank}
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Level {profile.level} · {profile.xp} XP</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">XP to next level</h2>
        <Progress value={percentage} className="h-3" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">🔥 {profile.streak_days}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Day streak</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
          <p className="text-2xl font-bold text-primary">{profile.xp}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Achievements</h2>
        <Link href="/profile/achievements" className="text-primary font-medium hover:underline">
          View all achievements →
        </Link>
      </div>
    </div>
  );
}
