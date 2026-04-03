import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "./constants";

/**
 * Edge-safe session verification for middleware (no Node APIs, no DB).
 * Validates HS256 JWT signed with AUTH_SECRET.
 */
export async function verifySessionCookie(req: NextRequest): Promise<{ userId: string; sessionId: string } | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    const userId = payload.sub;
    const sessionId = payload.sid;
    if (typeof userId !== "string" || typeof sessionId !== "string") return null;
    return { userId, sessionId };
  } catch {
    return null;
  }
}
