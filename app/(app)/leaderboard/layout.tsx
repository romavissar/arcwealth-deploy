import { LeaderboardSubnav } from "@/components/leaderboard/LeaderboardSubnav";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Community</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Leaderboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Track the top learners and see how XP gains stack up over time.
        </p>
        <div className="mt-4">
          <LeaderboardSubnav />
        </div>
      </section>
      <div>{children}</div>
    </div>
  );
}
