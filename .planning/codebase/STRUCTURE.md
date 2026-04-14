# Codebase Structure

**Analysis Date:** 2026-04-03

## Directory Layout

```
arcwealth/
├── app/                      # Next.js App Router
│   ├── (app)/                # Authenticated app shell (sidebar layout)
│   │   ├── dashboard/
│   │   ├── learn/            # Curriculum map + [topicId] lesson/quiz/textbook routes
│   │   ├── textbook/
│   │   ├── glossary/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   ├── classroom/        # Teacher/student classroom (teacher redirects here)
│   │   ├── teacher/          # Redirect only → /classroom
│   │   ├── admin/
│   │   ├── settings/
│   │   └── account-settings/
│   ├── (auth)/               # sign-in, sign-up, login, register routes
│   ├── actions/              # Server Actions (nudge, teacher, classroom, progress, friends)
│   ├── api/                  # Route handlers (webhooks, avatar, profile, account)
│   ├── layout.tsx            # Root: ClerkProvider + ThemeProvider
│   └── globals.css
├── components/               # React components by feature
│   ├── layout/               # Sidebar, TopBar
│   ├── learn/
│   ├── textbook/             # TextbookMarkdown, diagrams/*
│   ├── classroom/
│   ├── teacher/
│   ├── profile/, glossary/, leaderboard/, admin/, account/, ui/
├── lib/                      # Shared logic & Supabase clients
│   └── supabase/             # server.ts, client.ts, middleware.ts
├── types/                    # database.ts, user.ts, curriculum.ts
├── supabase/
│   ├── migrations/           # SQL migrations (numbered)
│   └── seed.ts               # DB seed (tsx script)
├── textbook/                 # Static/source assets for textbook (if any markdown lives here)
├── prompts/                  # Non-runtime prompts/docs
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

## Directory Purposes

**`app/(app)/`:**
- Purpose: Logged-in experience with shared chrome
- Contains: `layout.tsx` (sync user, role, notifications), feature routes
- Key files: `app/(app)/layout.tsx`, `app/(app)/learn/page.tsx`, `app/(app)/classroom/page.tsx`

**`app/actions/`:**
- Purpose: Server Actions callable from Client and Server Components
- Contains: `teacher.ts`, `classroom.ts`, `nudge.ts`, `progress.ts`, `friends.ts` (as present)
- Key files: `app/actions/progress.ts`, `app/actions/classroom.ts`

**`components/`:**
- Purpose: UI building blocks; feature folders mirror routes
- Contains: Client components (`"use client"`) and server-friendly components
- Key files: `components/layout/Sidebar.tsx`, `components/learn/CurriculumMap.tsx`

**`lib/`:**
- Purpose: Domain logic, external SDK wrappers, curriculum config
- Key files: `lib/sync-user.ts`, `lib/roles.ts`, `lib/curriculum.ts`, `lib/supabase/server.ts`

**`supabase/migrations/`:**
- Purpose: Schema source of truth
- Generated: No — hand-written SQL
- Committed: Yes

## Key File Locations

**Entry Points:**
- `app/layout.tsx` — root layout
- `app/(app)/layout.tsx` — app chrome + user sync
- `middleware.ts` — Clerk protection

**Configuration:**
- `next.config.js` — images remote patterns
- `tsconfig.json` — `@/*` path alias
- `tailwind.config.ts` — Tailwind theme

**Core Logic:**
- `lib/curriculum.ts` — topic IDs, titles, restructure / filter behavior
- `lib/progress.ts` — unlock order when `FLOW` populated
- `app/actions/progress.ts` — complete lesson/quiz, XP, achievements

**Testing:**
- Not detected — add under `__tests__/` or co-located `*.test.ts` when introducing tests

## Naming Conventions

**Files:**
- `page.tsx` — route segment page
- `layout.tsx` — layout
- `route.ts` — API route handler
- Components: PascalCase file names matching export (e.g. `CurriculumMap.tsx`)

**Directories:**
- Next route groups: `(app)`, `(auth)` — parentheses excluded from URL
- Dynamic segments: `[topicId]`, `[userId]`

## Where to Add New Code

**New Feature (e.g. new student-facing section):**
- Primary code: `app/(app)/<feature>/page.tsx` + `components/<feature>/`
- Server Actions: `app/actions/<feature>.ts` or extend existing action module
- Types: `types/` if shared

**New API route:**
- Implementation: `app/api/<name>/route.ts`

**New Supabase table:**
- Migration: `supabase/migrations/NNN_description.sql`
- Types: extend `types/database.ts` (manual today)

**Utilities:**
- Shared helpers: `lib/<name>.ts`

## Special Directories

**`.next/`:**
- Purpose: Build output
- Generated: Yes
- Committed: No (typically gitignored)

**`node_modules/`:**
- Purpose: Dependencies
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-04-03*
