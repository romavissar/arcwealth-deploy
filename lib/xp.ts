/** Total XP required to reach each level (1–50). Level 50 = 50,000 XP. Quadratic curve. */
export const LEVEL_THRESHOLDS: number[] = Array.from({ length: 50 }, (_, i) =>
  i === 0 ? 0 : Math.round(50_000 * (i / 49) ** 2)
);

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXPProgressToNextLevel(xp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const level = getLevelFromXP(xp);
  const current = xp - LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  const required = nextThreshold ? nextThreshold - LEVEL_THRESHOLDS[level - 1] : 1;
  return {
    current,
    required,
    percentage: required > 0 ? Math.min(100, Math.floor((current / required) * 100)) : 100,
  };
}
