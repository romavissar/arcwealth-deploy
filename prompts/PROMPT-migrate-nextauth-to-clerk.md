# Migration Prompt: Switch ArcWealth from NextAuth to Clerk

Use this prompt to migrate the ArcWealth app from **NextAuth v5** to **Clerk** for authentication. The app uses **Supabase** only for database (topics, lesson_content, glossary, user_profiles, user_progress, xp_events, achievements) and storage (avatars). **Do not use Supabase Auth** for sign-in after migration; Clerk is the sole identity provider.

---

## Goal

- Replace NextAuth with Clerk (sign-in, sign-up, session, middleware).
- Keep all Supabase usage: PostgreSQL tables, RLS, Storage (avatars).
- **User identity**: Clerk user ID becomes the canonical `user_id` / `user_profiles.id`. The `user_profiles` table must use Clerk’s user id (e.g. `user_2abc...`) as primary key. If the current schema has `user_profiles.id REFERENCES auth.users(id)`, remove that FK and make `id` a plain UUID or TEXT primary key for Clerk user id.
- Preserve behavior: protected routes, “Continue Learning”, profile, XP, progress, glossary, leaderboard.

---

## 1. Dependencies

**Remove:**

- `next-auth`
- `@auth/supabase-adapter` (if present)

**Add:**

- `@clerk/nextjs` (latest)

---

## 2. Environment Variables

**Remove (NextAuth):**

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`
- `NEXTAUTH_URL`

**Add (Clerk):**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Optional: `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (e.g. `/dashboard`)

Update `.env.example` and any docs (e.g. README) accordingly.

---

## 3. Files to Delete

- `app/api/auth/[...nextauth]/route.ts` — NextAuth API route (Clerk uses its own routes/hosted UIs or custom components).
- `lib/auth.ts` — NextAuth config and `auth`, `signIn`, `signOut`, `handlers` (replaced by Clerk helpers).

---

## 4. Files to Create or Replace

### 4.1 Root layout (ClerkProvider)

- **File:** `app/layout.tsx`
- **Change:** Wrap children with `<ClerkProvider>` from `@clerk/nextjs`. Remove any NextAuth `Providers` wrapper that only provided `SessionProvider`.

### 4.2 Middleware

- **File:** `middleware.ts`
- **Change:** Use `clerkMiddleware` from `@clerk/nextjs`. Protect the same routes: `/dashboard`, `/learn`, `/glossary`, `/profile`, `/leaderboard`. Unauthenticated users should redirect to `/sign-in` (or whatever path you use for Clerk sign-in). Use `createRouteMatcher` or equivalent to define protected paths and call `auth().protect()` or redirect when `!auth().userId`.

### 4.3 Auth pages (sign-in / sign-up)

- **Option A:** Use Clerk’s hosted pages: set `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, and create minimal app routes that render `<SignIn />` and `<SignUp />` from `@clerk/nextjs`.
- **Option B:** Keep custom UI at `/login` and `/register` but use Clerk’s `<SignIn />` and `<SignUp />` components, or use Clerk’s headless APIs (`useSignIn`, `useSignUp`) to keep your existing form UI and only swap the auth backend to Clerk.

**Files to adjust:**

- `app/(auth)/login/page.tsx` — Render Clerk sign-in (e.g. `<SignIn />` or custom form using Clerk hooks). Remove `LoginForm` that uses `signIn("credentials", ...)` and `signIn("google"|"apple")`, or replace their implementation with Clerk.
- `app/(auth)/register/page.tsx` — Render Clerk sign-up or custom form using Clerk’s sign-up APIs. Remove dependency on `registerUser` that uses Supabase `auth.signUp`; see “Sync user to Supabase” below.
- `components/auth/LoginForm.tsx` — Either delete (if using Clerk hosted/components) or refactor to use Clerk (e.g. `useSignIn()`, or redirect to Clerk sign-in).
- `components/auth/RegisterForm.tsx` — Same: delete or refactor to use Clerk sign-up; do not call Supabase Auth sign-up.

### 4.4 Sync user to Supabase (profile + progress)

- **When:** On first sign-in or sign-up with Clerk (when a new Clerk user is created).
- **Where:** Use Clerk’s **webhooks** (recommended) or run the sync inside the app when you first see a user that doesn’t exist in `user_profiles`.
- **Logic (same as today):**
  - Insert into `user_profiles`: `id` = Clerk user id, `username` (from Clerk username or email), `avatar_url` (from Clerk imageUrl if desired), `rank` = `'novice'`.
  - Seed `user_progress`: one row per topic, `user_id` = Clerk user id, `topic_id`, `status` = `'available'` only for `1.1.1`, else `'locked'`.
- **Implementation options:**
  - **Webhook:** Create `app/api/webhooks/clerk/route.ts` (or similar). On `user.created`, insert `user_profiles` and `user_progress` using `createServiceClient()`. Use Clerk’s webhook signing secret to verify the request.
  - **Lazy sync in app:** In a layout or server component that runs for protected routes, call a helper that checks if `user_profiles` has a row for `auth().userId`; if not, create profile + progress (and optionally call from middleware or a root layout so it runs once per user).

Remove or refactor:

- `app/actions/auth.ts` — Remove `registerUser` that uses Supabase `auth.signUp`. Registration is handled by Clerk; only “create profile + progress in Supabase” remains (webhook or lazy sync).

---

## 5. Replacing Session / User ID Everywhere

**Pattern:** Replace `auth()` (NextAuth) with Clerk’s server-side auth. Replace `useSession()` / `session.user` with Clerk’s client-side hooks. Use **Clerk’s user id** everywhere you currently use `(session?.user as { id?: string }).id` or `userId`.

### 5.1 Server-side: get current user id

- **From:** `import { auth } from "@/lib/auth"; const session = await auth(); const userId = (session?.user as { id?: string })?.id;`
- **To:** `import { auth } from "@clerk/nextjs/server"; const { userId } = await auth();`  
  Use `userId` (string | null). If `userId` is null on a protected route, redirect or return 401 (middleware should already redirect unauthenticated users).

**Files that use `auth()` from NextAuth (replace with Clerk’s `auth()`):**

- `app/page.tsx` — Redirect logged-in users to `/dashboard`; use Clerk `auth().userId`.
- `app/(app)/dashboard/page.tsx` — Use `userId` from Clerk `auth()` for Supabase queries.
- `app/(app)/learn/page.tsx` — Same.
- `app/(app)/learn/[topicId]/page.tsx` — Same.
- `app/(app)/learn/[topicId]/textbook/page.tsx` — Same.
- `app/(app)/learn/[topicId]/lesson/page.tsx` — Same.
- `app/(app)/learn/[topicId]/quiz/page.tsx` — Same.
- `app/(app)/glossary/page.tsx` — Same (optional: still pass progress for “unlocked” terms).
- `app/(app)/glossary/[term]/page.tsx` — Same.
- `app/(app)/profile/page.tsx` — Same.
- `app/(app)/profile/achievements/page.tsx` — Same.
- `app/api/profile/route.ts` — Use Clerk `auth()` to get `userId`; return profile from `user_profiles` for that id.
- `app/api/upload-avatar/route.ts` — Use Clerk `auth()` to get `userId`; upload to Supabase Storage and update `user_profiles.avatar_url`.
- `app/actions/progress.ts` — Both `completeLesson` and `completeQuiz`: get `userId` from Clerk `auth()` instead of NextAuth session.

### 5.2 Client-side: session / user

- **From:** `import { useSession } from "next-auth/react"; const { data: session } = useSession(); const userId = (session?.user as { id?: string })?.id;`
- **To:** `import { useUser, useAuth } from "@clerk/nextjs"; const { user } = useUser();` and use `user?.id`. For “is loaded” / “is signed in”, use `useAuth()` (e.g. `isLoaded`, `isSignedIn`).

**Files that use NextAuth client APIs:**

- `components/providers.tsx` — Remove `SessionProvider` from next-auth. If you only need Clerk, you can delete this file and wrap the app only with `ClerkProvider` in `app/layout.tsx`. If you keep `Providers` for other things, remove the NextAuth provider.
- `components/layout/TopBar.tsx` — Uses `useSession()`; switch to `useUser()` / `useAuth()` and show avatar or link to profile using Clerk’s `user`.
- `components/auth/ProfilePictureUpload.tsx` — Uses `useSession` and `update`; switch to Clerk’s `useUser()` and update avatar via your API (upload-avatar) and optionally Clerk’s user update if you store avatar there too.

**LoginForm / RegisterForm:** Already covered above (replace with Clerk sign-in/sign-up or remove if using hosted UI).

---

## 6. Sign-out and Navigation

- **Sign-out:** Wherever you had `signOut()` from next-auth, use Clerk’s `<SignOutButton>` or `useClerk().signOut()`.
- **Redirect after sign-in/sign-up:** Configure Clerk env vars (`NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, etc.) or pass `redirectUrl` / `afterSignOutUrl` where applicable.

---

## 7. Database / RLS Consideration

- **user_profiles.id:** Must store **Clerk user id** (string). If the current column type or FK assumes Supabase `auth.users(id)`, change the schema: drop the FK to `auth.users`, keep `user_profiles.id` as primary key (TEXT or UUID), and ensure RLS policies use `auth.uid()` only if you still use Supabase Auth for something. Since you’re moving to Clerk-only auth, RLS that relied on `auth.uid()` will no longer see a Supabase user. **Options:** (a) Use a Supabase **service role** client for all profile/progress reads and writes from the Next.js server (bypass RLS), or (b) introduce a custom JWT or header that Supabase accepts and set `auth.uid()` from Clerk user id (more involved). Simplest is (a): use `createServiceClient()` for any Supabase access that needs to read/write user_profiles or user_progress, and ensure your API/layout only calls these when Clerk `auth().userId` is present.
- **user_progress, xp_events, user_achievements:** Already keyed by `user_id`; keep them keyed by Clerk user id. RLS: same as above (service role from server, or adapt RLS if you add a way to pass Clerk id into Supabase).

---

## 8. Checklist Summary

- [ ] Install `@clerk/nextjs`; remove `next-auth` (and adapter if present).
- [ ] Update env vars (remove NextAuth, add Clerk); update `.env.example` and README.
- [ ] Delete `app/api/auth/[...nextauth]/route.ts` and `lib/auth.ts`.
- [ ] Add `ClerkProvider` in root layout; remove or repurpose `Providers` (no SessionProvider).
- [ ] Replace middleware with `clerkMiddleware`; protect `/dashboard`, `/learn`, `/glossary`, `/profile`, `/leaderboard`.
- [ ] Replace auth pages: use Clerk SignIn/SignUp (hosted or custom with Clerk hooks); remove Supabase Auth sign-up from register flow.
- [ ] Implement “sync new user to Supabase” (webhook or lazy sync) using Clerk user id.
- [ ] Replace every `auth()` (NextAuth) with Clerk’s `auth()` and use `userId`; replace every `useSession()` with `useUser()` / `useAuth()`.
- [ ] Update `app/api/profile/route.ts` and `app/api/upload-avatar/route.ts` to use Clerk `userId`.
- [ ] Update `app/actions/progress.ts` to use Clerk `userId`.
- [ ] Ensure `user_profiles.id` and all `user_id` columns use Clerk user id; adjust DB/RLS if needed (e.g. service role for server-side Supabase).
- [ ] Remove or refactor `components/auth/LoginForm.tsx` and `RegisterForm.tsx` and `app/actions/auth.ts` (no Supabase Auth for sign-up).
- [ ] Test: sign-up, sign-in (email and OAuth if configured), redirect to dashboard, continue learning, profile, avatar upload, progress, glossary, leaderboard.

---

## 9. Reference: Current NextAuth Usage (for search/replace)

- **Server:** `import { auth } from "@/lib/auth"; const session = await auth(); const userId = (session?.user as { id?: string })?.id;`
- **Client:** `import { useSession, signIn, signOut } from "next-auth/react"; const { data: session } = useSession(); signIn("google"); signOut();`
- **Middleware:** `import { auth } from "@/lib/auth"; export default auth((req) => { ... });`
- **API route:** `const session = await auth(); if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`

After migration, the same concepts map to Clerk’s `auth()`, `useUser()`, `useAuth()`, `SignIn`, `SignUp`, `SignOutButton`, and middleware.

Use this prompt as the single source of truth when performing the NextAuth → Clerk migration for ArcWealth.
