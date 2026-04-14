# Coding Conventions

**Analysis Date:** 2026-04-03

## Naming Patterns

**Files:**
- Route segments: Next.js conventions — `page.tsx`, `layout.tsx`, `loading.tsx` if added
- Components: PascalCase — `QuizPageClient.tsx`, `Sidebar.tsx`
- Server Actions modules: lowercase — `teacher.ts`, `progress.ts` under `app/actions/`
- Lib utilities: kebab-case or lowercase — `sync-user.ts`, `bucharest-time.ts`

**Functions:**
- camelCase — `ensureUserInSupabase`, `getCurrentUserRole`, `isKnownCurriculumTopic`
- Server Actions: verb phrases — `completeQuiz`, `getClassroomStudents`

**Variables:**
- camelCase; React state: `useState` names like `showRankUp`

**Types:**
- PascalCase for interfaces/types — `StudentProgress`, `ClassroomMessage`
- Type-only imports: `import type { ... }` where used (e.g. `QuizPageClient.tsx`)

## Code Style

**Formatting:**
- Implicit: Prettier-compatible (no `prettierrc` found in repo root); 2-space indent in sampled files
- Tailwind: `cn()` from `lib/utils.ts` merges class lists

**Linting:**
- `eslint` + `eslint-config-next` via `npm run lint`
- No custom `.eslintrc` file found — rely on Next defaults

## Import Organization

**Order (typical in repo):**
1. External packages (`react`, `next`, `@clerk/nextjs/server`, `@/components/...`)
2. Internal aliases `@/` — maps to repo root per `tsconfig.json`

**Path Aliases:**
- `@/*` → `./*` (e.g. `@/lib/utils`, `@/app/actions/progress`)

## Error Handling

**Patterns:**
- Server Actions return `{ error?: string; ... }` for expected failures
- `redirect()` from `next/navigation` for auth failures on pages
- Webhook: `Response` with 400/200

## Logging

**Framework:** `console` in development branches in `lib/resend.ts`, `app/actions/classroom.ts`

**Patterns:**
- Guard with `process.env.NODE_ENV === "development"` where present

## Comments

**When to Comment:**
- Non-obvious business rules — e.g. checkpoint XP tiers in `components/learn/QuizPageClient.tsx`
- Curriculum “restructure mode” called out in `lib/curriculum.ts`

**JSDoc/TSDoc:**
- Used sparingly on exported helpers — e.g. `ensureUserInSupabase` in `lib/sync-user.ts`

## Function Design

**Size:** Large Server Action files exist (`app/actions/classroom.ts` ~400+ lines); prefer extracting helpers when touching

**Parameters:** Options objects for optional sync fields — `ensureUserInSupabase(userId, opts?)`

**Return Values:** Discriminated unions via optional `error` field for actions

## Module Design

**Exports:** Named exports for components and functions; default export for `page.tsx` / `layout.tsx`

**Barrel Files:** Not heavily used — import from concrete paths

---

*Convention analysis: 2026-04-03*
