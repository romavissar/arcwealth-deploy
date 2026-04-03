import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/auth/session-edge";

/**
 * `USE_LEGACY_CLERK` (default true): existing Clerk middleware.
 * Set to `false` after layouts/actions use custom auth — JWT session cookie (`arcwealth_session`) + AUTH_SECRET.
 */
const useLegacyClerk = process.env.USE_LEGACY_CLERK !== "false";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/learn(.*)",
  "/glossary(.*)",
  "/profile(.*)",
  "/leaderboard(.*)",
]);

export default useLegacyClerk
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) await auth.protect();
    })
  : async function authMiddleware(req: NextRequest) {
      if (!isProtectedRoute(req)) return NextResponse.next();
      const session = await verifySessionCookie(req);
      if (!session) {
        const signIn = new URL("/sign-in", req.url);
        signIn.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(signIn);
      }
      return NextResponse.next();
    };

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sign-in|sign-up).*)"],
};
