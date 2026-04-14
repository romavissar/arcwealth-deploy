# Technology Stack

**Analysis Date:** 2026-04-03

## Languages

**Primary:**
- TypeScript (strict mode) — all application code in `app/`, `components/`, `lib/`, `types/`
- SQL — Supabase migrations in `supabase/migrations/`

**Secondary:**
- CSS — Tailwind utility classes in components and `app/globals.css`

## Runtime

**Environment:**
- Node.js (for Next.js dev/build; version not pinned in repo)

**Package Manager:**
- npm (inferred from `package-lock.json` if present)
- Lockfile: check repository root for `package-lock.json` / `pnpm-lock.yaml`

## Frameworks

**Core:**
- Next.js `14.2.25` — App Router (`app/`), Server Components by default, Server Actions (`"use server"` in `app/actions/`)
- React `^18.3.1` — UI

**Testing:**
- Not detected — no Vitest/Jest/Cypress/Playwright config or `*.test.*` files in repo

**Build/Dev:**
- `next dev` / `next build` / `next start` — scripts in `package.json`
- Tailwind CSS `^3.4.15` — `tailwind.config.ts`, `postcss.config.mjs` (if present)
- ESLint `^8.57.0` with `eslint-config-next` — `npm run lint`

## Key Dependencies

**Critical:**
- `@clerk/nextjs` `^6.9.3` — authentication, `middleware.ts`, `ClerkProvider` in `app/layout.tsx`
- `@supabase/supabase-js` `^2.47.10` + `@supabase/ssr` `^0.5.2` — Postgres via `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`
- `zod` `^3.23.8` — validation (used with forms/resolvers where applicable)
- `zustand` `^5.0.1` — client state (use where imported)

**UI & content:**
- `tailwind-merge`, `clsx`, `class-variance-authority` — styling utilities
- Radix UI primitives (`@radix-ui/react-*`) — accessible components layered under `components/ui/`
- `lucide-react` — icons
- `framer-motion` — animation
- `react-markdown`, `remark-gfm`, `rehype-unwrap-images`, `remark-unwrap-images` — textbook markdown rendering (`components/textbook/TextbookMarkdown.tsx`)
- `recharts` — charts under `components/textbook/diagrams/`

**Email & webhooks:**
- `resend` `^6.9.2` — transactional email (`lib/resend.ts`)
- `svix` `^1.38.0` — Clerk webhook signature verification (`app/api/webhooks/clerk/route.ts`)

**Other:**
- `react-hook-form` + `@hookform/resolvers` — forms
- `canvas-confetti` — celebration UI
- `react-easy-crop` — avatar cropping (if used in profile flow)

## Configuration

**Environment:**
- Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` (Resend links), Clerk publishable key (standard Clerk `NEXT_PUBLIC_*` vars — configured via Clerk/Next integration, not all referenced in grep of source)
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_WEBHOOK_SECRET`, `RESEND_API_KEY`, optional `RESEND_FROM`
- Do not commit secrets; `.env` files are gitignored

**Build:**
- `next.config.js` — image `remotePatterns` for Supabase storage, Google avatars, Clerk (`img.clerk.com`)
- `tsconfig.json` — `paths`: `@/*` → project root

## Platform Requirements

**Development:**
- Node compatible with Next 14
- Supabase project (URL + anon + service role keys)
- Clerk application (keys + webhook endpoint for `user.created`)

**Production:**
- Node server (`next start`) or Vercel/similar Next hosting
- Same env vars as development, production URLs for `NEXT_PUBLIC_APP_URL` and Clerk dashboard

---

*Stack analysis: 2026-04-03*
