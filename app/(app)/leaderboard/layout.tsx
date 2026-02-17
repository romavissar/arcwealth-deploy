import { LeaderboardSubnav } from "@/components/leaderboard/LeaderboardSubnav";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-xl mx-auto">
      <LeaderboardSubnav />
      {children}
    </div>
  );
}
