---
phase: auth-replace-clerk
type: master
scope: Replace Clerk with self-hosted auth (EU-aligned, GDPR/DPA)
stack: Next.js 14 App Router, TypeScript, Supabase Postgres + Storage, Resend
requirements:
  - AUTH-REQ-01
  - AUTH-REQ-02
  - AUTH-REQ-03
  - AUTH-REQ-04
  - AUTH-REQ-05
  - AUTH-REQ-06
  - AUTH-REQ-07
  - AUTH-REQ-08
  - AUTH-REQ-09
  - GDPR-REQ-01
  - GDPR-REQ-02
---

# Master plan: Self-hosted authentication (replace Clerk)

## Phase goal (outcome-shaped)

Learners and staff authenticate through **credentials and OAuth you control**, with sessions enforced in **Next.js middleware**, profile data in **Supabase (EU region / your stack)**, and **no dependency on Clerk** for identity or webhooks.

---

## Requirement IDs (traceability)

| ID | Requirement |
|----|----------------|
| AUTH-REQ-01 | Google & Apple OAuth/OIDC sign-in |
| AUTH-REQ-02 | Forgot / reset password (signed, expiring tokens) |
| AUTH-REQ-03 | User-toggleable 2FA (TOTP); SMS documented as optional/out-of-scope |
| AUTH-REQ-04 | Email verification on registration |
| AUTH-REQ-05 | Registration: first name, last name, birth date, email, password |
| AUTH-REQ-06 | Email/password login toggleable (admin or feature flag; OAuth-only mode) |
| AUTH-REQ-07 | Profile pictures: upload, storage, privacy controls |
| AUTH-REQ-08 | Migration from Clerk IDs to new user IDs + webhook removal |
| AUTH-REQ-09 | Testing & verification checkpoints |
| GDPR-REQ-01 | Legal/organizational GDPR & school DPA workstream |
| GDPR-REQ-02 | Technical privacy & security controls (encryption, RLS, export/delete, breach outline) |

---

## Current codebase anchors (must read before implementation)

| Area | Location |
|------|----------|
| Middleware | `middleware.ts` — `clerkMiddleware`, `createRouteMatcher`, `auth.protect()` |
| App shell auth | `app/(app)/layout.tsx` — `auth()`, `currentUser()`, `ensureUserInSupabase()` |
| User sync | `lib/sync-user.ts` — upsert `user_profiles`, seed `user_progress`; **student** rows do not sync name/email from IdP |
| Roles | `lib/roles.ts`, `lib/sync-user.ts` (`ADMIN_EMAIL`) |
| Webhook | `app/api/webhooks/clerk/route.ts` — Svix-verified `user.created` |
| Schema | `user_profiles.id` is **TEXT** (Clerk-style), FKs across `user_progress`, classroom, friends, etc. (`002_clerk_user_id.sql`) |
| RLS | Policies use `auth.uid()::text = id` — today **Supabase Auth `uid()` does not match** app usage (service role in app code); migration must reconcile **either** JWT from Supabase Auth **or** keep service-role + app-layer auth only |
| Avatar | `app/api/upload-avatar/route.ts`, bucket `avatars` |
| Account APIs | `app/api/account/*`, `components/account/*` |

---

## Tech options (brief) & default recommendation

**Clarification:** “Self-built” spans (a) **custom auth module in your Next.js app** (you own tables, sessions, OAuth glue) vs (b) **self-hosted IdP** (Keycloak, etc.). This plan assumes **(a)** unless ops mandates **(b)**.

| Option | Pros | Cons | Fit for this repo |
|--------|------|------|---------------------|
| **A — Custom sessions + OAuth (e.g. Lucia + Arctic, or hand-rolled with `jose` + DB sessions)** | Full control; minimal magic; fits “credentials on our DB”; works with existing `TEXT` user ids | You implement more edge cases (CSRF, rotation, OAuth state) | **Default recommendation** for EU data residency + ownership |
| **B — Auth.js (NextAuth v5)** | Mature OAuth + credentials patterns; App Router docs | Adapter work for your schema; mental model differs from current `ensureUserInSupabase` | Strong alternative if speed > bespoke |
| **C — Supabase Auth** | RLS `auth.uid()` alignment; hosted in project region | Not “self-built” in the strict sense; less control over token UX | Good if you relax “custom code” in favor of platform auth |
| **D — Keycloak / self-hosted OIDC** | Central IdP; SAML later | Ops burden; overkill for single app | Only if school IT requires IdP |

**Default:** **Option A** — **Lucia** (or equivalent session abstraction) + **Arctic** for Google/Apple + **Argon2id** (via `@node-rs/argon2` or `argon2`) for passwords, **Postgres session store** (or Lucia adapter) in **Supabase**. Persist users in new tables (`auth_user`, `session`, `oauth_account`, `verification_token`, etc.) and **link** to existing `user_profiles.id` after migration.

**Alternatives line:** If the team prefers less glue, implement **Option B** with a **Prisma/Drizzle adapter** and the same migration story.

---

## Identity & migration strategy

### Primary key strategy

- **Keep `user_profiles.id` as TEXT** (already matches FK graph: friends, classroom, `student_teacher`, …).
- **New users:** generate opaque IDs (e.g. `nanoid`, prefixed `usr_`) — avoid embedding PII.
- **Clerk users:** one-time migration maps `user_xxxxx` → new `usr_…` **or** retain Clerk-shaped IDs only for legacy rows and store `legacy_clerk_id` in a mapping table. **Recommended:** new canonical ID + **`user_id_migration` table** `{ old_id, new_id, migrated_at }` for audit and rollback scripts.

### Data migration (cutover-focused)

1. **Export** Clerk users (Clerk Dashboard / API): email, external ids, OAuth linkage (no password hashes from Clerk for local verification — plan **password reset** or **“set password”** for migrated password users).
2. **Freeze** writes during cutover window (communicate to schools).
3. **Script** (Supabase transaction): for each Clerk `id`, insert/update auth tables + remap **all** FKs (`user_profiles.id` and every referencing table). Order respects FKs: child tables that reference `user_profiles(id)` must be updated together (PostgreSQL: deferrable constraints or temp mapping + `UPDATE … FROM mapping`).
4. **Dual-run** (optional): run Clerk + new auth in parallel only for a short pilot — doubles complexity; prefer **single cutover** + maintenance page unless regulatory review demands phased rollout.

### Application migration

- Replace `auth()` / `currentUser()` usage with **`getSession()`** (or equivalent) from the new auth layer across: `app/(app)/layout.tsx`, Server Actions in `app/actions/*.ts`, API routes.
- Remove **`@clerk/nextjs`** from `app/layout.tsx` (`ClerkProvider`), auth pages `app/(auth)/sign-in`, `sign-up`.
- **Delete or stub** `app/api/webhooks/clerk/route.ts`; remove `CLERK_*` env vars and **Svix** if unused elsewhere.
- Update **`ensureUserInSupabase`** to accept **your** user object (id, email, name, avatar URL) instead of Clerk; keep student **immutability** rules for name/email.

### OAuth token handling

- Store **refresh tokens** only if needed for long-lived Google APIs; otherwise **session-only**. Encrypt at rest if stored (see GDPR technical).
- **Apple Private Relay:** treat email as **unstable identifier** for matching; prefer **Apple `sub`** in `oauth_account.providerAccountId` for linkage; document in privacy policy.

---

## GDPR / DPA workstreams

### A — Legal & organizational (not only code)

| Work item | Purpose |
|-----------|---------|
| **Lawful basis** | Document **contract** (school DPA) vs **consent** for marketing; ed-tech often **legitimate interests** / **public task** — **counsel review** |
| **DPIA** | Required when systematic monitoring of minors / high-risk processing — template: purposes, necessity, proportionality, risks, mitigations |
| **School DPA** | Processor vs controller roles; subprocessors list; **SCCs** if any US subprocessor (e.g. some email providers); **UK/EU transfer mechanisms** |
| **Policies** | Privacy notice (minors: parental gate where required), cookie policy if non-essential cookies, retention schedule |
| **Breach process** | 72h GDPR notification workflow; internal escalation; **outline** in runbook (not code) |
| **Minors** | Age gates / parental consent **by jurisdiction** — product + legal; **not** a single code flag |

### B — Technical controls (implementation-facing)

| Control | Implementation notes |
|---------|------------------------|
| **EU hosting** | Supabase project in **EU region**; Next.js deployment in EU if student data passes through app servers |
| **Encryption** | TLS in transit; **at rest** via provider; **field-level** for TOTP secrets / OAuth tokens if persisted |
| **Passwords** | **Argon2id**; never log passwords; rate-limit login & reset endpoints |
| **Sessions** | HttpOnly, Secure, SameSite; rotation; short-lived access + longer server session if using JWT |
| **RLS** | Decide: **(1)** issue Supabase JWTs tied to `auth.users` and align `auth.uid()` **or** **(2)** keep service role + **strict** Server Actions checks — document threat model (either way, **no** client-trusted `user_id`) |
| **Consent / audit** | Optional `consent_log` / `processing_legal_basis` for sign-up checkbox evidence |
| **Data subject rights** | **Export:** bundle `user_profiles` + related rows + avatar; **Delete:** cascade from `user_profiles` (already ON DELETE CASCADE on many tables) + storage objects |
| **Retention** | Job to purge **expired** reset/verification tokens; configurable profile retention per school policy |
| **Subprocessors** | Env flag list for privacy page; Resend data location / DPA |

---

## Risks register

| Risk | Mitigation |
|------|------------|
| **Minors / parental consent** | Jurisdiction-specific flows; legal sign-off before launch in new countries |
| **Password storage** | Argon2id + secrets management; breach-resistant reset tokens (single-use, hash stored) |
| **OAuth token leakage** | Minimal storage; encrypt; short TTL |
| **Apple relay emails** | Link by provider `sub`; avoid email-as-only key |
| **Migration data loss** | Backup + dry-run on staging + mapping table |
| **Session fixation / XSS** | HttpOnly cookies, CSP headers (future hardening) |
| **2FA lockout** | Recovery codes; admin/support process (documented, minimal data exposure) |

---

## Dependency graph (high level)

```
[Schema: auth tables + migration mapping]
        ↓
[Session layer + middleware replacement]
        ↓
[Email/password + verification + reset + flags]
        ↓
[OAuth Google/Apple]
        ↓
[2FA TOTP + toggle]
        ↓
[Profile fields + avatar privacy + birth date on user_profiles]
        ↓
[Cutover migration + remove Clerk + GDPR export/delete]
        ↓
[Verification: automated + human UAT]
```

---

## Waves & executable plans

Execute in order unless `depends_on` allows parallel (e.g. GDPR docs parallel to early schema).

### Wave 1 — Foundation: schema & session shell

**Plans:** `auth-01-schema`, `auth-02-session-core`

**must_haves (goal-backward):**

```yaml
must_haves:
  truths:
    - "New users can be represented in DB without Clerk ids"
    - "Middleware can block protected routes based on session cookie"
  artifacts:
    - path: "supabase/migrations/0xx_auth_tables.sql"
      provides: "auth_user, session, oauth_account, tokens"
    - path: "lib/auth/session.ts" (or lib/auth/index.ts)
      provides: "getSession, requireUser"
  key_links:
    - from: "middleware.ts"
      to: "session validation"
      via: "edge-safe cookie read + redirect"
```

<details>
<summary>Plan auth-01-schema (tasks)</summary>

<tasks>

<task type="auto">
  <name>Task: Auth and migration tables</name>
  <files>supabase/migrations/0xx_auth_tables.sql, types/database.ts</files>
  <action>
    Add migration: `auth_user` (id TEXT PK, email unique, email_verified_at, password_hash nullable, first_name, last_name, birth_date, two_factor_enabled, …), `session`, `oauth_account` (provider, providerAccountId unique per provider), `verification_token` / `password_reset_token` (hashed token, expires_at), optional `user_id_migration(old_id TEXT PK, new_id TEXT, migrated_at)`. Decide nullable password when OAuth-only. Add `FEATURE_PASSWORD_LOGIN` via DB `app_config` row or env consumed server-side only. Extend `user_profiles` with `birth_date` if not present; link `user_profiles.id` = `auth_user.id` for canonical path. Follow existing naming in `005_roles_admin_teacher_student.sql`.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Migration applies cleanly; types updated</done>
</task>

<task type="auto">
  <name>Task: RLS / service-role strategy doc in code comment</name>
  <files>lib/supabase/server.ts or lib/auth/README-inline.md (only if project already uses lib docs — prefer short comment in server.ts)</files>
  <action>Document chosen strategy: Supabase JWT vs service-role + server-only checks. If aligning RLS with Supabase Auth, plan follow-up migration for policies; else state threat model for service role.</action>
  <verify>
    <automated>grep -q "service role\|RLS\|auth.uid" lib/supabase/server.ts || true</automated>
  </verify>
  <done>Single authoritative comment for implementers</done>
</task>

</tasks>

</details>

<details>
<summary>Plan auth-02-session-core (tasks)</summary>

<tasks>

<task type="auto">
  <name>Task: Session helpers for App Router</name>
  <files>lib/auth/session.ts, middleware.ts</files>
  <action>
    Implement session creation/validation using chosen stack (Lucia or custom): use `cookies()` from `next/headers` in Server Actions/Route Handlers; middleware reads signed session cookie and redirects unauthenticated users from protected matchers (mirror current `createRouteMatcher` list in `middleware.ts`). Remove `@clerk/nextjs` only after parity — for this task, **feature-flag** or branch: `USE_LEGACY_CLERK` env to allow incremental migration if needed; otherwise replace directly per executor branch.
  </action>
  <verify>
    <automated>npm run build && npm run lint</automated>
  </verify>
  <done>Protected routes require valid session; sign-in page reachable without session</done>
</task>

<task type="auto" tdd="true">
  <name>Task: Session cookie security attributes</name>
  <files>lib/auth/session.test.ts (if vitest/jest added) or manual verify checklist in task</files>
  <behavior>
    - Cookie has HttpOnly and Secure in production
    - SameSite=Lax or Strict per threat model
  </behavior>
  <action>Implement; add minimal test setup if repo has none — if no test runner, verify via Next config inspection and document in verify block.</action>
  <verify>
    <automated>MISSING — add vitest or use build + code review gate; prefer `npm run lint` until test runner exists</automated>
  </verify>
  <done>Documented secure defaults</done>
</task>

</tasks>

</details>

---

### Wave 2 — Email/password, verification, reset, toggle

**Plans:** `auth-03-credentials-flows`

<tasks>

<task type="auto">
  <name>Task: Register Server Action + email verification send</name>
  <files>app/actions/auth.ts (new), lib/email/auth-emails.ts, lib/resend.ts</files>
  <action>
    Zod validate first/last name, birth date, email, password strength. Hash password (Argon2id). Insert `auth_user` + `user_profiles` in one transaction (service client). Create verification token; send email via Resend with link to `app/(auth)/verify-email/page` or API route. **Birth date:** store for age compliance; do not expose to other users by default (see privacy).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Unverified user cannot access app shell or receives limited UI per product decision</done>
</task>

<task type="auto">
  <name>Task: Login + logout + password reset</name>
  <files>app/actions/auth.ts, app/api/auth/forgot-password/route.ts, app/api/auth/reset-password/route.ts</files>
  <action>
    Respect `FEATURE_PASSWORD_LOGIN` / admin flag: when off, return clear error on credential login and hide forms. Forgot: POST email → rate-limited → signed token (hashed in DB) → email. Reset: POST token + new password → invalidate sessions. Logout: invalidate session cookie + DB session row.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Flows work end-to-end in dev with Mailpit or Resend test domain</done>
</task>

</tasks>

---

### Wave 3 — OAuth (Google & Apple)

**Plans:** `auth-04-oauth`

<tasks>

<task type="auto">
  <name>Task: Google OAuth routes + account linking</name>
  <files>app/api/auth/google/route.ts, app/api/auth/callback/google/route.ts, lib/auth/oauth.ts</files>
  <action>
    Use Arctic or provider SDK; PKCE; state CSRF token. Upsert `oauth_account`; if email matches existing verified user, **link** with care (account takeover) — require verified email or login session. Map profile image URL to avatar policy (download to Supabase storage optional).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Google sign-in creates session and `ensureUserInSupabase` equivalent runs</done>
</task>

<task type="auto">
  <name>Task: Apple Sign In</name>
  <files>app/api/auth/apple/route.ts, app/api/auth/callback/apple/route.ts</files>
  <action>
    Apple requires service ID, key, team id; handle relay email; store `sub` as provider account id. Test on HTTPS (ngrok/Vercel preview).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Apple flow completes; user row uses stable provider id</done>
</task>

</tasks>

---

### Wave 4 — 2FA (TOTP)

**Plans:** `auth-05-2fa`

<tasks>

<task type="auto">
  <name>Task: TOTP enrollment + login challenge</name>
  <files>lib/auth/totp.ts, app/(app)/settings/security/page.tsx, app/actions/auth-2fa.ts</files>
  <action>
    Use `otpauth` / `hi-base32` or similar; encrypt TOTP secret at rest. Flow: enable → show QR → verify code → store; login: password OK → if 2FA on, prompt for TOTP; optional recovery codes (hashed). Document SMS 2FA as **out of scope** in settings copy.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>User can enable/disable 2FA; login enforces when enabled</done>
</task>

</tasks>

---

### Wave 5 — UI replacement & profile

**Plans:** `auth-06-ui-profile`

<tasks>

<task type="auto">
  <name>Task: Replace Clerk auth pages</name>
  <files>app/(auth)/sign-in/[[...sign-in]]/page.tsx, app/(auth)/sign-up/[[...sign-up]]/page.tsx, app/layout.tsx</files>
  <action>
    Remove `ClerkProvider`; build sign-in/sign-up with existing Tailwind/RHF/Zod patterns per `components/account/*`. Wire to new actions. Middleware matcher: allow `/sign-in`, `/sign-up`, `/verify-email`, `/forgot-password`, `/reset-password`, OAuth callbacks.
  </action>
  <verify>
    <automated>npm run build && npm run lint</automated>
  </verify>
  <done>No Clerk components on auth routes</done>
</task>

<task type="auto">
  <name>Task: Profile picture + privacy</name>
  <files>app/api/upload-avatar/route.ts, components/auth/ProfilePictureUpload.tsx, user_profiles columns if needed</files>
  <action>
    Authorize with new session user id. Keep Supabase `avatars` bucket; add **visibility** field if product requires (e.g. friends-only) — minimal change: default private to classroom/teachers per existing behavior. Ensure **student** PII rules in `ensureUserInSupabase` remain (students: no overwrite from OAuth for name/email if policy requires).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Upload works; URLs do not leak other users’ data</done>
</task>

</tasks>

---

### Wave 6 — Clerk migration & cleanup

**Plans:** `auth-07-migration`

<tasks>

<task type="auto">
  <name>Task: One-time migration script</name>
  <files>scripts/migrate-clerk-users.ts, supabase/migrations (if mapping table not yet applied)</files>
  <action>
    Read Clerk export or API; for each user insert `auth_user` + remap `user_profiles.id` FKs using mapping table in **single transaction per batch**; **do not** copy password hashes from Clerk (force password set email). Preserve `teacher_list`, `student_teacher` relationships via id mapping.
  </action>
  <verify>
    <automated>npx tsx scripts/migrate-clerk-users.ts --dry-run</automated>
  </verify>
  <done>Dry-run report counts rows; live run on staging first</done>
</task>

<task type="auto">
  <name>Task: Remove Clerk</name>
  <files>package.json, middleware.ts, app/(app)/layout.tsx, all clerk imports</files>
  <action>
    Uninstall `@clerk/nextjs`, `@clerk/themes`; delete webhook route; remove env vars from `.env.example` docs; grep codebase for `clerk` and `@clerk`.
  </action>
  <verify>
    <automated>! rg -i clerk --glob '*.ts' --glob '*.tsx' . || exit 0</automated>
  </verify>
  <done>No Clerk references; build passes</done>
</task>

</tasks>

---

### Wave 7 — GDPR utilities & verification

**Plans:** `auth-08-gdpr-tech`, `auth-09-qa`

<tasks>

<task type="auto">
  <name>Task: Export + delete Server Actions</name>
  <files>app/actions/gdpr.ts, app/api/account/delete/route.ts</files>
  <action>
    Export JSON: profile, progress, achievements, classroom relations metadata; delete: cascade + storage avatars + sessions. Log processing for audit (minimal PII in logs).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Callable only by authenticated user for self</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>UAT: Full auth matrix</name>
  <what-built>All waves integrated</what-built>
  <how-to-verify>
    1. Register with birth date → verify email → land in app.
    2. Login email/password; toggle password login off → OAuth only works.
    3. Google + Apple sign-in (staging URLs).
    4. Forgot/reset password.
    5. Enable 2FA → login requires TOTP; recovery code works.
    6. Avatar upload; profile visibility check.
    7. Migrated user (staging): data intact.
  </how-to-verify>
  <resume-signal>approved or list defects</resume-signal>
</task>

</tasks>

---

## Testing & automated verification (continuous)

| Layer | Command / check |
|-------|------------------|
| Build | `npm run build` |
| Lint | `npm run lint` |
| Auth unit tests | Add when introducing crypto/session helpers (recommended: **vitest** for `lib/auth/*`) |
| E2E | Optional Playwright for sign-in flow (out of scope unless added) |

**Nyquist note:** Add `lib/auth/session.test.ts` or equivalent in Wave 1–2 so `<automated>` is never permanently `MISSING`.

---

## Success criteria (phase complete when)

1. All **AUTH-REQ-*** behaviors work in staging without Clerk.
2. **GDPR-REQ-01**: DPIA/privacy/DPA tasks **tracked** (spreadsheet or issue list) with owner — code cannot replace legal sign-off.
3. **GDPR-REQ-02**: Export/delete paths exist; tokens hashed; sessions secured; subprocessors documented.
4. Clerk **removed** from codebase and dependencies.
5. **UAT checkpoint** signed off for the matrix above.

---

## Output artifact for execute-phase

After each sub-plan execution, create `.planning/phases/auth-replace-clerk/auth-0N-SUMMARY.md` with files changed and decisions.

---

## Execution context (GSD)

@/Users/rom/.claude/get-shit-done/workflows/execute-plan.md

---

*Master plan generated for arcwealth — Next.js 14 App Router + Supabase. Aligns with `.planning/codebase/ARCHITECTURE.md` and `INTEGRATIONS.md` (2026-04-03).*
