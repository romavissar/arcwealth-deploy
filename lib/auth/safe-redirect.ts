/** Allow only same-origin relative paths (middleware redirect_url). */
export function safeInternalPath(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  const path = raw.split("?")[0]?.split("#")[0] ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("..") || path.includes("\\")) return null;
  return path;
}
