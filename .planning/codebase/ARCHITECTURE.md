# Architecture

**Analysis Date:** 2026-04-03

## Pattern Overview

**Overall:** Next.js App Router full-stack app — React Server Components fetch data, Server Actions mutate, Clerk gates sessions, Supabase (service role) persists state.

**Key Characteristics:**
- **Dual identity:** Clerk owns sessions; Supabase stores profiles/progress keyed by Clerk `user_id`
- **Thin route shells:** Pages in `app/(app)/` compose queries + presentational components from `components/`
- **Server Actions as backend:** `app/actions/*.ts` encapsulate authorization + Supabase writes (teacher, classroom, progress, nudge, friends)

## Layers

**Presentation (routes + components):**
- Purpose: HTTP routes, layouts, UI
- Location: `app/`, `components/`
- Contains: page components, `layout.tsx`, client components where interactivity required
- Depends on: `lib/`, `@clerk/nextjs/server`, Server Actions
- Used by: Browser requests

**Domain / helpers (`lib/`):**
- Purpose: Pure or shared logic — XP, ranks, hearts, curriculum metadata, time, Resend wrappers
- Location: `lib/`
- Contains: `lib/curriculum.ts`, `lib/progress.ts`, `lib/xp.ts`, `lib/supabase/*`, etc.
- Depends on: `types/`, env, Supabase clients
- Used by: Pages and Server Actions

**Data access:**
- Purpose: Read/write Supabase
- Location: `createServiceClient()` / `createClient()` from `lib/supabase/server.ts`; client in `lib/supabase/client.ts`
- Contains: Query builders; no separate repository layer
- Depends on: Supabase
- Used by: Server Components, Server Actions, API routes

**Edge / middleware:**
- Purpose: Clerk session protection for selected routes
- Location: `middleware.ts`
- Contains: `clerkMiddleware` + `createRouteMatcher` for `/dashboard`, `/learn`, `/glossary`, `/profile`, `/leaderboard`
- Depends on: Clerk
- Used by: All matched requests

**Types:**
- Purpose: Shared TypeScript types
- Location: `types/database.ts` (Supabase table shapes — partial vs runtime), `types/user.ts`, `types/curriculum.ts`

## Data Flow

**Sign-in / app shell:**

1. User hits Clerk-hosted or embedded sign-in (`app/(auth)/`)
2. On navigation into `app/(app)/` layout (`app/(app)/layout.tsx`), `auth()` + `currentUser()` run
3. `ensureUserInSupabase()` (`lib/sync-user.ts`) upserts `user_profiles`, links teacher/student roles, seeds `user_progress` if new user
4. `getCurrentUserRole()` (`lib/roles.ts`) loads sidebar + Classroom entry
5. `getMyNotifications()` (`app/actions/nudge.ts`) feeds `TopBar`

**Learn path (curriculum map):**

1. `app/(app)/learn/page.tsx` loads `topics` ordered by `order_index`, `user_progress` for user
2. Topics filtered by `isKnownCurriculumTopic()` (`lib/curriculum.ts`) — when coded curriculum sets are empty, all DB topics pass; when populated, stale rows are hidden
3. Effective progress map promotes next topic to `available` if previous completed (repairs edge cases)
4. `CurriculumMap` renders topic list with links to `app/(app)/learn/[topicId]/page.tsx`

**Topic hub (`/learn/[topicId]`):**

1. `app/(app)/learn/[topicId]/page.tsx` checks `user_progress`; if locked, recomputes unlock from ordered topics + previous topic completion, else redirects `/learn`
2. By `topic_type` from `topics`: checkpoint/boss → `/quiz`; lesson → `/lesson`; else → `/textbook/[topicId]`

**Lesson & quiz completion:**

1. Lesson: `app/(app)/learn/[topicId]/lesson/page.tsx` loads `lesson_content` (`content_type` `duolingo_lesson`)
2. Quiz: `app/(app)/learn/[topicId]/quiz/page.tsx` loads quiz JSON from `lesson_content`
3. Completion flows through Server Actions in `app/actions/progress.ts` — updates `user_progress`, XP, streaks, hearts, achievements, marks teacher nudges read, etc.

**Textbook (read-only reference):**

1. `app/(app)/textbook/page.tsx` groups DB `topics` (`topic_type` `lesson`) by level/section for accordion UI
2. `app/(app)/textbook/[topicId]/page.tsx` loads `lesson_content` with `content_type` `textbook` (markdown) and renders textbook UI

**Dashboard:**

1. `app/(app)/dashboard/page.tsx` aggregates profile XP/streak/rank, progress vs ordered topics, latest teacher nudge (`getLatestNudge` in `app/actions/nudge.ts`)
2. Continue/next lesson derived from first non-completed topic in order (with fallback logic)

**Teacher & classroom:**

1. `app/(app)/teacher/page.tsx` redirects to `/classroom`
2. `app/(app)/classroom/page.tsx` branches on `getCurrentUserRole()`: admin → `/admin/classrooms`; teacher → `ClassroomViewTeacher` + `app/actions/classroom.ts`; student/user with link → `ClassroomViewStudent`; no teacher → redirect `/dashboard`
3. Teacher student list and stats: `getMyStudents` in `app/actions/teacher.ts` (also used by classroom)
4. Nudges/congratulations: `app/actions/teacher.ts` inserts `teacher_nudges` / `teacher_congratulations`, sends Resend email

**State Management:**
- Server state in Supabase; URL for navigation
- Client state: component-local and Zustand where used (search imports for `zustand`)

## Key Abstractions

**Curriculum (code vs DB):**
- Purpose: Optional in-code topic lists and flow; when empty arrays, app trusts DB only (“restructure mode”)
- Examples: `lib/curriculum.ts` (`VALID_LEARN_TOPIC_IDS`, `LESSON_COUNTS`, `LEVEL_NAMES`), `lib/progress.ts` (`FLOW` for section/checkpoint sequencing — empty means `getNextTopicToUnlock` returns null)
- Pattern: Filter DB rows through `isKnownCurriculumTopic`; dashboard/learn both use this

**Role resolution:**
- Purpose: Single role string for UI and authorization
- Examples: `lib/roles.ts`, `lib/sync-user.ts` (`resolveRole`)

**Progress & gamification:**
- Purpose: XP, level, rank, hearts, streaks
- Examples: `lib/xp.ts`, `lib/ranks.ts`, `lib/hearts.ts`, `app/actions/progress.ts`

## Entry Points

**HTTP app:**
- Location: `app/layout.tsx` — `ClerkProvider`, `ThemeProvider`
- Triggers: Every page load
- Responsibilities: Global HTML shell, theming

**Authenticated shell:**
- Location: `app/(app)/layout.tsx`
- Triggers: Routes under `(app)`
- Responsibilities: Sidebar, TopBar, `ensureUserInSupabase`, role, notifications

**Middleware:**
- Location: `middleware.ts`
- Triggers: All routes except static assets and sign-in/up paths per `config.matcher`
- Responsibilities: `auth.protect()` for matcher routes only

**API routes:**
- `app/api/webhooks/clerk/route.ts` — Clerk events
- `app/api/upload-avatar/route.ts` — avatar upload
- `app/api/profile/route.ts` — profile updates
- `app/api/account/*` — account operations

## Error Handling

**Strategy:** Return `{ error: string }` from Server Actions; pages render error strings; API routes return `Response` with status codes

**Patterns:**
- Authorization checks at start of Server Actions (`auth()`, `canAccessTeacherDashboard()`, etc.)
- Try/catch in some actions (e.g. `getMyStudents` in `app/actions/teacher.ts`)

## Cross-Cutting Concerns

**Logging:** Ad-hoc `console` / dev-only logging in email and classroom code paths

**Validation:** Zod + RHF on forms; Server Actions validate inputs manually in places

**Authentication:** Clerk middleware partial protection + per-page `auth()` + redirects to `/sign-in`; routes not in middleware matcher may rely on layout/page checks

---

*Architecture analysis: 2026-04-03*
