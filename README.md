# ArcWealth

Duolingo-style financial literacy platform for teenagers. Built with Next.js 14, Supabase, and self-hosted auth (email/password, Google OAuth, optional 2FA).

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Apply migrations in `supabase/migrations/` in order (SQL Editor or CLI).
   - Create a storage bucket named `avatars` (public).
   - The app uses the **service role** on the server; end-user identity is the app session cookie, not Supabase Auth.

3. **Environment**
   - Copy `.env.example` to `.env.local`.
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - Set `AUTH_SECRET` (at least 32 characters; e.g. `openssl rand -base64 32`).
   - For email verification and password reset: `RESEND_API_KEY`, `RESEND_FROM`, `NEXT_PUBLIC_APP_URL`.
   - For Google sign-in: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (redirect URI `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`).

4. **Seed database**
   ```bash
   npm run db:seed
   ```
   Requires Supabase env vars. Seeds topics, achievements, sample lesson content, and glossary terms.

5. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Register or sign in at `/sign-in`, then use Dashboard and Learn.

## Generate level content

Use the deterministic-first generator to build Duolingo-style level content from a textbook lesson markdown file.

1. Add env vars:
   - `OPENROUTER_API_KEY` (optional, enables Sonnet-assisted wording refinement)
   - `LEVEL_GEN_MODEL` (optional, default: `anthropic/claude-sonnet-4.5`)
2. Run generation:
   ```bash
   npm run generate_level -- lesson_1.md
   ```
3. Deterministic-only fallback (no AI, no DB):
   ```bash
   npm run generate_level:deterministic -- lesson_1.md
   ```

Output:
- Writes artifact JSON to `generated/levels/<lesson>.level.json`
- Upserts `duolingo_lesson` and `quiz` rows in `lesson_content` for the mapped topic (`lesson_1.md` -> `1.1.1`) unless `--no-db` is set.

Delete learn-level content (without touching textbook):

```bash
npm run delete_level lesson_1.md
```

This removes only learn-side content (`duolingo_lesson` + `quiz`) for that topic and deletes the generated artifact file. Textbook markdown and textbook content are not modified.

## Features

- **Auth**: Email/password, Google OAuth, TOTP 2FA; sessions via signed httpOnly cookie (`arcwealth_session`). New users get `user_profiles` + `user_progress` from lazy sync in the app layout.
- **Curriculum**: 180 lessons in 4 levels; checkpoints and boss challenges; sequential unlock.
- **Learn**: Textbook view, Duolingo-style lessons (multiple choice, true/false, fill blank, scenario, match).
- **Progress**: XP, levels, streaks, hearts; rank-up screen on boss completion.
- **Glossary**: Terms unlocked by progress; search and term pages.
- **Profile**: XP history, achievements, rank badge.
- **Leaderboard**: Weekly XP ranking.

## Project structure

- `app/` — App Router: auth routes, (app) dashboard/learn/glossary/profile/leaderboard, API routes.
- `components/` — learn (map, lesson, quiz, RankUp), textbook, ui, layout, account.
- `lib/` — supabase clients, auth, sync-user, xp, ranks, curriculum, progress.
- `types/` — database, curriculum, user.
- `supabase/` — migrations, seed script.

## Notes

- User profiles and progress are ensured on each app load via `ensureUserInSupabase` in the `(app)` layout.
- Lesson content is stored as JSONB; seed adds sample textbook + exercises for topics `1.1.1`–`1.2.2`.
- Add more content via Supabase or by extending `supabase/seed.ts`.
