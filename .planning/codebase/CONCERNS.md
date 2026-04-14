# Codebase Concerns

**Analysis Date:** 2026-04-03

## Tech Debt

**Curriculum “restructure” / empty coded curriculum:**
- Issue: `lib/curriculum.ts` uses empty `LESSON_COUNTS`, `LESSON_RANGES`, `LEVEL_NAMES`, `SECTION_NAMES_BY_LEVEL` — `VALID_LEARN_TOPIC_IDS` is empty, so `isKnownCurriculumTopic()` returns true for every DB topic (intentional “trust DB only”). When arrays are later filled, stale `topics` rows may disappear from Learn/Dashboard unless DB is cleaned.
- Files: `lib/curriculum.ts`, consumers `app/(app)/learn/page.tsx`, `app/(app)/dashboard/page.tsx`
- Impact: Team must coordinate DB + code when locking down curriculum filters
- Fix approach: Document single source of truth; add migration to delete orphan `topics`; keep `isKnownCurriculumTopic` in sync with seed

**Progress flow array empty:**
- Issue: `lib/progress.ts` has `FLOW` as empty array — `getNextTopicToUnlock()` always returns null; unlock sequencing for checkpoint/boss may rely entirely on DB + page logic instead
- Files: `lib/progress.ts`
- Impact: Any code path calling `getNextTopicToUnlock` does not advance via coded flow until `FLOW` is populated
- Fix approach: Align `FLOW` with `supabase/seed.ts` topic graph when curriculum stabilizes

**Type definitions vs database:**
- Issue: `types/database.ts` does not list all tables used in code (e.g. `teacher_list`, `classroom_messages`, `classroom_assignments`, `teacher_nudges`, `friend_requests`, `friends`, `user_notification_state`, etc.)
- Files: `types/database.ts` vs `app/actions/*.ts`, `supabase/migrations/`
- Impact: Weaker autocomplete and no compile-time check for column names
- Fix approach: Regenerate Supabase types or extend `Database` interface manually

**Duplicated admin email constant:**
- Issue: `ADMIN_EMAIL` / `romavissar@gmail.com` appears in `lib/sync-user.ts`, `lib/roles.ts`, and `components/layout/Sidebar.tsx`
- Files: above
- Impact: Risk of drift; security-by-email is fragile
- Fix approach: Single env var or Clerk metadata/role; one module exporting admin check

## Known Bugs

**Webhook vs layout: first topic for progress seeding:**
- Issue: `app/api/webhooks/clerk/route.ts` marks first available topic as `"1.1.1"` when seeding `user_progress`; `lib/sync-user.ts` uses first topic from `order("order_index")` — mismatch if curriculum order does not start at `1.1.1`
- Files: `app/api/webhooks/clerk/route.ts`, `lib/sync-user.ts`
- Symptoms: Wrong initial unlock for users created via webhook vs first visit sync
- Fix approach: Use same “first topic id” helper everywhere (DB-driven)

## Security Considerations

**Service role usage:**
- Risk: `createServiceClient()` bypasses RLS; any bug in Server Action authorization exposes cross-user data
- Files: `lib/supabase/server.ts`, all `app/actions/*.ts`
- Current mitigation: Explicit `auth()` + role checks before queries
- Recommendations: Audit each action; consider least-privilege patterns or RLS-compatible anon client for user-scoped reads where feasible

**Hardcoded admin email:**
- Risk: Email change or typo in code affects who is admin
- Files: `lib/sync-user.ts`, `lib/roles.ts`, `components/layout/Sidebar.tsx`
- Current mitigation: Single known address
- Recommendations: Clerk public metadata or env-based allowlist

## Performance Bottlenecks

**Classroom / teacher aggregates:**
- Problem: `getMyStudents` and classroom flows run multiple sequential queries (profiles, progress, topics, achievements)
- Files: `app/actions/teacher.ts`, `app/actions/classroom.ts`
- Cause: N+1-style patterns and large in-memory joins
- Improvement path: SQL views or RPC in Supabase; pagination for large rosters

## Fragile Areas

**Large action modules:**
- Why fragile: `app/actions/classroom.ts` is long; changes risk merge conflicts and missed auth checks
- Files: `app/actions/classroom.ts`, `components/classroom/ClassroomViewTeacher.tsx`
- Safe modification: Add tests first; extract sub-functions with clear names
- Test coverage: None

## Scaling Limits

**Clerk webhook + user creation:**
- Current capacity: Single webhook handler; depends on Supabase insert throughput
- Limit: Bursty signups could queue; no retry logic in code shown
- Scaling path: Idempotent webhook handling (already partially) + monitoring

## Dependencies at Risk

**Next.js 14.x:**
- Risk: Security and feature updates require periodic `next` bumps
- Impact: Build and runtime
- Migration plan: Follow Next upgrade guide; test App Router and Clerk

## Missing Critical Features

**Automated testing:**
- Problem: No unit/E2E tests
- Blocks: Safe refactors of progress and payment-sensitive flows (if added later)

## Test Coverage Gaps

**Entire app:**
- What's not tested: Server Actions, curriculum filtering, role resolution
- Files: `app/actions/progress.ts`, `lib/roles.ts`, `lib/curriculum.ts`
- Risk: Regressions on XP, unlocks, teacher visibility
- Priority: High for `progress.ts`; Medium for UI

---

*Concerns audit: 2026-04-03*
