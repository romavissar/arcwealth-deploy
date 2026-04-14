# External Integrations

**Analysis Date:** 2026-04-03

## APIs & External Services

**Authentication (Clerk):**
- User sign-in/sign-up, session — `@clerk/nextjs` in `middleware.ts`, layouts, Server Components via `@clerk/nextjs/server` (`auth`, `currentUser`)
- Webhook — `POST` `app/api/webhooks/clerk/route.ts`: verifies Svix headers with `CLERK_WEBHOOK_SECRET`, handles `user.created` — creates `user_profiles` row and seeds `user_progress` from `topics` order
- SDK: `@clerk/nextjs`; theme: `@clerk/themes` (if used on auth pages)

**Email (Resend):**
- Nudges, congratulations, classroom announcements/assignments — `lib/resend.ts`
- Auth: `RESEND_API_KEY`; sender: `RESEND_FROM` or default onboarding address in code

**Webhook verification:**
- Svix (`svix` package) — Clerk webhook signatures

## Data Storage

**Databases:**
- Supabase Postgres — primary application data
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (cookie-aware SSR client in `lib/supabase/server.ts`)
  - Service role: `SUPABASE_SERVICE_ROLE_KEY` — `createServiceClient()` in `lib/supabase/server.ts` (bypasses RLS; used by Server Actions and API routes)
  - Migrations: `supabase/migrations/*.sql` — schema evolution (topics, progress, classroom, friends, notifications, etc.)

**File Storage:**
- Supabase Storage bucket `avatars` — `app/api/upload-avatar/route.ts` uploads and sets `user_profiles.avatar_url`

**Caching:**
- None dedicated (no Redis/Edge Config usage detected in application code)

## Authentication & Identity

**Auth Provider:**
- Clerk — external IdP; user id is Clerk string id (`user_…`), stored as `user_profiles.id` (see `002_clerk_user_id.sql`)

**App-level roles:**
- Resolved in `lib/roles.ts` + `lib/sync-user.ts`: `admin` | `teacher` | `student` | `user`
- Admin: hardcoded primary email check (see `ADMIN_EMAIL` in `lib/sync-user.ts`, `lib/roles.ts`, duplicated in `components/layout/Sidebar.tsx`)
- Teacher: `user_profiles.role` and/or presence in `teacher_list` table (`lib/sync-user.ts`)
- Student: `student_teacher` link forces student UI even if profile role is still `user` (`lib/roles.ts`)

**Supabase Auth:**
- Not used for login; RLS policies in migrations reference `auth.uid()` but server code predominantly uses service role for app queries

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry/Datadog imports in scanned files)

**Logs:**
- `console` / development-only branches in `lib/resend.ts`, `app/actions/classroom.ts`

## CI/CD & Deployment

**Hosting:**
- Not pinned in repo — Next.js compatible host (e.g. Vercel)

**CI Pipeline:**
- Not detected — no `.github/workflows` or similar in exploration scope

## Environment Configuration

**Required env vars (application):**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Clerk: publishable + secret keys (standard Next.js Clerk env names from Clerk docs)
- `CLERK_WEBHOOK_SECRET` — Clerk webhook signing
- `RESEND_API_KEY` — emails; optional `RESEND_FROM`
- `NEXT_PUBLIC_APP_URL` — absolute links in emails (defaults in code if unset)

**Secrets location:**
- Host/Vercel env UI or local `.env.local` (never commit)

## Webhooks & Callbacks

**Incoming:**
- `app/api/webhooks/clerk/route.ts` — `user.created`

**Outgoing:**
- Resend API from `lib/resend.ts` (nudges, classroom emails, etc.)

---

*Integration audit: 2026-04-03*
