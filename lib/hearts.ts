/** Heart regeneration: 1 heart every 5 minutes. */
export const REGEN_SECONDS = 5 * 60;
const MAX_HEARTS_DEFAULT = 5;

/**
 * Compute heart regeneration: 1 heart every REGEN_SECONDS, cap at maxHearts.
 * Returns updated hearts and lastHeartsAt (use now() when applying so the clock resets).
 */
export function applyRegeneration(
  hearts: number,
  lastHeartsAt: string | null,
  maxHearts: number = MAX_HEARTS_DEFAULT
): { hearts: number; lastHeartsAt: string } {
  const now = new Date();
  const last = lastHeartsAt ? new Date(lastHeartsAt) : now;
  const elapsedMs = now.getTime() - last.getTime();
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const add = Math.min(Math.floor(elapsedSeconds / REGEN_SECONDS), Math.max(0, maxHearts - hearts));
  const newHearts = Math.min(maxHearts, hearts + add);
  return { hearts: newHearts, lastHeartsAt: now.toISOString() };
}
