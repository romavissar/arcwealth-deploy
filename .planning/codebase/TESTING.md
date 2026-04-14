# Testing Patterns

**Analysis Date:** 2026-04-03

## Test Framework

**Runner:**
- Not configured — no `vitest.config.*`, `jest.config.*`, or Playwright/Cypress in repo

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
npm run lint          # ESLint via Next lint
npm run build         # Compile check (no dedicated test step)
```

## Test File Organization

**Location:**
- No `*.test.ts`, `*.spec.ts`, or `*.test.tsx` files found

**Naming:**
- When adding tests: prefer `__tests__/` next to module or `*.test.ts` co-located

**Structure:**
- Not established — choose Vitest + React Testing Library for units/components; Playwright for E2E if needed

## Test Structure

**Suite Organization:**
- Not applicable

**Patterns:**
- Not applicable

## Mocking

**Framework:** Not applicable

**Patterns:**
- Not applicable

**What to Mock:**
- When adding tests: mock Clerk `auth()` / `currentUser`; mock Supabase with test doubles or MSW for API routes

**What NOT to Mock:**
- Prefer integration tests against local Supabase for critical progress flows (optional test DB)

## Fixtures and Factories

**Test Data:**
- Seed script: `supabase/seed.ts` — usable for local manual verification

**Location:**
- `supabase/seed.ts` — topics, achievements (see file for structure)

## Coverage

**Requirements:** None enforced

**View Coverage:**
- Not applicable until a test runner is added

## Test Types

**Unit Tests:**
- Not present — candidate units: `lib/xp.ts`, `lib/curriculum.ts` (`isKnownCurriculumTopic`, `parseTopicId`)

**Integration Tests:**
- Not present — candidate: Server Actions with mocked Supabase

**E2E Tests:**
- Not used — candidate flows: sign-in → dashboard → open learn topic

## Common Patterns

**Async Testing:**
- Not applicable

**Error Testing:**
- Not applicable

---

*Testing analysis: 2026-04-03*
