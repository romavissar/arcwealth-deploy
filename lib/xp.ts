export const LEVEL_THRESHOLDS: number[] = [
  0, 100, 250, 500, 850, 1300, 1900, 2650, 3600, 4800, 6300, 8100, 10200, 12650,
  15450, 18600, 22100, 25950, 30150, 34700, 39600, 44850, 50450, 56400, 62700,
  69350, 76350, 83700, 91400, 99450, 107850, 116600, 125700, 135150, 144950,
  155100, 165600, 176450, 187650, 199200, 211100, 223350, 235950, 248900, 262200,
  275850, 289850, 304200, 318900, 333950,
];

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
