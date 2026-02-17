/**
 * Helpers for Europe/Bucharest (EET/EEST) for assignment due date/time.
 */

const BUCHAREST_TZ = "Europe/Bucharest";

/** Parse date (YYYY-MM-DD) and time (HH:mm) as Europe/Bucharest, return ISO string (UTC). */
export function bucharestToISO(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const offsetMinutes = getBucharestOffsetMinutes(y ?? 2025, m ?? 1, d ?? 1);
  const utcMs =
    Date.UTC(y ?? 2025, (m ?? 1) - 1, d ?? 1, hh ?? 23, mm ?? 59, 0, 0) -
    offsetMinutes * 60 * 1000;
  return new Date(utcMs).toISOString();
}

/** Offset for Europe/Bucharest on given date: 120 (EET) or 180 (EEST) minutes. */
function getBucharestOffsetMinutes(year: number, month: number, day: number): number {
  const lastSundayMarch = new Date(year, 2, 31);
  while (lastSundayMarch.getDay() !== 0) lastSundayMarch.setDate(lastSundayMarch.getDate() - 1);
  const lastSundayOctober = new Date(year, 9, 31);
  while (lastSundayOctober.getDay() !== 0) lastSundayOctober.setDate(lastSundayOctober.getDate() - 1);
  const date = new Date(year, month - 1, day);
  if (date < lastSundayMarch || date > lastSundayOctober) return 120;
  if (date.getTime() === lastSundayMarch.getTime()) return date.getHours() >= 3 ? 180 : 120;
  if (date.getTime() === lastSundayOctober.getTime()) return date.getHours() >= 4 ? 120 : 180;
  return date >= lastSundayMarch && date < lastSundayOctober ? 180 : 120;
}

/** Format an ISO timestamp for display in Europe/Bucharest (date and time). */
export function formatInBucharest(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    timeZone: BUCHAREST_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Format an ISO timestamp as date only in Bucharest. */
export function formatDateInBucharest(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { timeZone: BUCHAREST_TZ });
}

/** Format an ISO timestamp as time only in Bucharest (e.g. "23:59"). */
export function formatTimeInBucharest(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    timeZone: BUCHAREST_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Format as "25 Feb 2025, 23:59" in Bucharest. */
export function formatDateTimeInBucharest(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    timeZone: BUCHAREST_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
