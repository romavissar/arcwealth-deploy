export interface Rank {
  slug: string;
  title: string;
  icon: string;
  color: string;
  darkColor?: string;
  unlockedByLevel: number;
  userLevelRequired: number;
  description: string;
}

export const RANKS: Rank[] = [
  {
    slug: "novice",
    title: "Novice",
    icon: "🌱",
    color: "text-gray-600 bg-gray-100",
    darkColor: "dark:text-gray-300 dark:bg-gray-700",
    unlockedByLevel: 0,
    userLevelRequired: 1,
    description: "Everyone starts somewhere. Your financial journey begins now.",
  },
  {
    slug: "apprentice",
    title: "Apprentice",
    icon: "📘",
    color: "text-green-600 bg-green-100",
    darkColor: "dark:text-green-300 dark:bg-green-900/50",
    unlockedByLevel: 1,
    userLevelRequired: 10,
    description: "You understand the basics of money. The real learning starts here.",
  },
  {
    slug: "practitioner",
    title: "Practitioner",
    icon: "🏦",
    color: "text-blue-600 bg-blue-100",
    darkColor: "dark:text-blue-300 dark:bg-blue-900/50",
    unlockedByLevel: 2,
    userLevelRequired: 20,
    description: "You can manage money with confidence. Banks and debt hold no mystery.",
  },
  {
    slug: "strategist",
    title: "Strategist",
    icon: "📈",
    color: "text-purple-600 bg-purple-100",
    darkColor: "dark:text-purple-300 dark:bg-purple-900/50",
    unlockedByLevel: 3,
    userLevelRequired: 30,
    description: "You think in assets, not expenses. Wealth building is your game.",
  },
  {
    slug: "expert",
    title: "Expert",
    icon: "🧠",
    color: "text-red-600 bg-red-100",
    darkColor: "dark:text-red-300 dark:bg-red-900/50",
    unlockedByLevel: 4,
    userLevelRequired: 40,
    description: "You see through financial traps, manage risk, and understand the system.",
  },
  {
    slug: "hero",
    title: "Financial Hero",
    icon: "🏆",
    color: "text-amber-600 bg-amber-100",
    darkColor: "dark:text-amber-300 dark:bg-amber-900/50",
    unlockedByLevel: 5,
    userLevelRequired: 50,
    description: "You've mastered financial literacy. You are the ArcWealth Hero.",
  },
];

export function getRankForCurriculumLevel(curriculumLevelCompleted: number): Rank {
  const found = [...RANKS].reverse().find((r) => r.unlockedByLevel <= curriculumLevelCompleted);
  return found ?? RANKS[0];
}

export function getRankBySlug(slug: string): Rank | undefined {
  return RANKS.find((r) => r.slug === slug);
}
