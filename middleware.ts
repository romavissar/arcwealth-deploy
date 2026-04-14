import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/auth/session-edge";

/** Protected app routes: require `arcwealth_session` JWT (see `lib/auth/session-edge`). */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/learn",
  "/glossary",
  "/profile",
  "/leaderboard",
  "/settings",
  "/classroom",
  "/textbook",
  "/admin",
  "/teacher",
  "/welcome",
] as const;

const AUTH_ENTRY_PREFIXES = ["/sign-in", "/sign-up"] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthEntryPath(pathname: string): boolean {
  return AUTH_ENTRY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const session = await verifySessionCookie(req);

  if (isAuthEntryPath(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtectedPath(pathname) && !session) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect_url", pathname + req.nextUrl.search);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|sign-in|sign-up|credentials|api/auth|verify-email|favicon.ico).*)",
    "/sign-in/:path*",
    "/sign-up/:path*",
  ],
};
