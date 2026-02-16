# ArcWealth

Duolingo-style financial literacy platform for teenagers. Built with Next.js 14, Supabase, and Clerk.

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Clerk**
   - Create an application at [clerk.com](https://clerk.com).
   - Enable Email, Google, and/or Apple sign-in as needed.
   - Copy the publishable key and secret key into your env.

3. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Run the SQL in `supabase/migrations/001_initial.sql` in the SQL Editor.
   - Run `supabase/migrations/002_clerk_user_id.sql` so `user_profiles.id` uses TEXT (Clerk user id).
   - Create a storage bucket named `avatars` (public).
   - No Supabase Auth required; Clerk is the identity provider.

4. **Environment**
   - Copy `.env.example` to `.env.local`.
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
   - Optional: set `CLERK_WEBHOOK_SECRET` and point Clerk’s “User created” webhook to `https://your-domain/api/webhooks/clerk` for syncing new users to Supabase (otherwise lazy sync in the app layout is used).

5. **Seed database**
   ```bash
   npm run db:seed
   ```
   Requires Supabase env vars. Seeds topics, achievements, sample lesson content, and glossary terms.

6. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign up or sign in (Clerk), then use Dashboard and Learn.

## Features

- **Auth**: Clerk (email, Google, Apple). New users are synced to Supabase `user_profiles` and `user_progress` via webhook or lazy sync.
- **Curriculum**: 180 lessons in 4 levels; checkpoints and boss challenges; sequential unlock.
- **Learn**: Textbook view, Duolingo-style lessons (multiple choice, true/false, fill blank, scenario, match).
- **Progress**: XP, levels, streaks, hearts; rank-up screen on boss completion.
- **Glossary**: Terms unlocked by progress; search and term pages.
- **Profile**: XP history, achievements, rank badge.
- **Leaderboard**: Weekly XP ranking.

## Project structure

- `app/` — App Router: (auth) sign-in/sign-up, (app) dashboard/learn/glossary/profile/leaderboard, api.
- `components/` — learn (map, lesson, quiz, RankUp), textbook, ui, layout, auth.
- `lib/` — supabase clients, sync-user, xp, ranks, curriculum, progress.
- `types/` — database, curriculum, user.
- `supabase/` — migrations (001 + 002 for Clerk), seed script.

## Notes

- User profiles and progress are created on first sign-in (Clerk webhook or lazy sync in app layout).
- Lesson content is stored as JSONB; seed adds sample textbook + exercises for topics `1.1.1`–`1.2.2`.
- Add more content via Supabase or by extending `supabase/seed.ts`.
