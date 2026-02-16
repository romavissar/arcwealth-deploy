# 🏗️ Cursor Prompt: ArcWealth — Financial Literacy Platform (Duolingo-Style)

## Project Overview

Build a **Duolingo-inspired financial literacy web platform** for teenagers, called **ArcWealth**. The platform teaches financial literacy through gamified lessons, a structured textbook, a glossary, and quizzes — all organized into a leveled curriculum.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | `next-auth` v5 (Auth.js) with Supabase adapter — Google, Apple, Email/Password |
| File Uploads | Supabase Storage (profile pictures) |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand or Jotai |
| Animations | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

---

## Curriculum Structure

The curriculum is organized in a strict hierarchy. Use this mapping consistently across the **entire codebase, database schema, and URLs**:

```
Level    → e.g., Level 1 = "Money Awareness"        → topic_level (1, 2, 3, 4)
Section  → e.g., Section 1 = "Money Psychology"     → topic_section
Lesson   → e.g., Lesson 1 = "What Is Money?"        → topic_lesson

Topic ID format: {level}.{section}.{lesson}
Examples:
  1.1.1  → Level 1, Section 1, Lesson 1 ("What Is Money?")
  1.2.1  → Level 1, Section 2, Lesson 11 ("Types of Income")
  2.1.1  → Level 2, Section 4, Lesson 31 ("What Is a Bank?")
  4.3.15 → Level 4, Section 11, Lesson 165 ("Civic Responsibility")

Section numbering is GLOBAL across the full curriculum (Section 4 is the first section of Level 2).
Lesson numbering is also GLOBAL (Lesson 31 is the first lesson of Level 2).
```

Full curriculum (180 lessons across 4 levels, 11 sections):

**Level 1 — Money Awareness (30 Lessons)**
- Section 1: Money Psychology (Lessons 1–10) + Checkpoint Quiz
- Section 2: Earning & Income (Lessons 11–20) + Checkpoint Quiz
- Section 3: Tracking Money (Lessons 21–30) + Level 1 Boss Challenge

**Level 2 — Financial Stability (45 Lessons)**
- Section 4: Banking Basics (Lessons 31–45) + Checkpoint
- Section 5: Debt & Credit (Lessons 46–65) + Level 2 Boss Challenge
- Section 6: Inflation & Time (Lessons 66–75)

**Level 3 — Wealth Building (60 Lessons)**
- Section 7: Investing Basics (Lessons 76–95) + Checkpoint
- Section 8: Assets & Wealth Systems (Lessons 96–115) + Level 3 Boss Challenge

**Level 4 — Advanced Thinking (45 Lessons)**
- Section 9: Risk & Probability (Lessons 116–130) + Checkpoint
- Section 10: Financial Traps (Lessons 131–150)
- Section 11: Taxes & Society (Lessons 151–165)

**Final Hero Phase (Lessons 166–180)**
- Personal audit, planning challenges, graduation

---

## Database Schema (Supabase)

Create the following tables in Supabase. Use Row Level Security (RLS) on all user-data tables.

```sql
-- Curriculum structure
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT UNIQUE NOT NULL,          -- e.g. "1.1.1"
  level_number INT NOT NULL,              -- 1–4
  section_number INT NOT NULL,            -- 1–11
  lesson_number INT NOT NULL,             -- 1–180
  title TEXT NOT NULL,
  description TEXT,
  topic_type TEXT NOT NULL                -- 'lesson' | 'checkpoint' | 'boss_challenge' | 'hero'
    CHECK (topic_type IN ('lesson','checkpoint','boss_challenge','hero')),
  xp_reward INT NOT NULL DEFAULT 10,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lesson content (textbook + duolingo lesson data stored as JSONB for flexibility)
CREATE TABLE lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT REFERENCES topics(topic_id),
  content_type TEXT NOT NULL              -- 'textbook' | 'duolingo_lesson' | 'quiz' | 'simulation'
    CHECK (content_type IN ('textbook','duolingo_lesson','quiz','simulation')),
  content JSONB NOT NULL,                 -- flexible content structure (see below)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Glossary
CREATE TABLE glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  example TEXT,
  related_topic_ids TEXT[],              -- array of topic_id strings
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,                        -- path to Supabase Storage object (bucket: avatars)
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,           -- user XP level (1–50+)
  rank TEXT NOT NULL DEFAULT 'Novice',    -- rank title tied to curriculum level milestones
  streak_days INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  hearts INT NOT NULL DEFAULT 5,
  max_hearts INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track lesson/topic completion per user
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(topic_id),
  status TEXT NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked','available','in_progress','completed')),
  score INT,                             -- 0–100 for quizzes
  xp_earned INT DEFAULT 0,
  attempts INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- XP history log
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,                  -- e.g. "Completed lesson 1.1.1", "Daily streak bonus"
  topic_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements / badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,                    -- emoji or icon name
  xp_reward INT DEFAULT 0
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_slug TEXT REFERENCES achievements(slug),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_slug)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only read/write their own data)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
```

---

## XP & Level System

### XP Rewards per Activity

| Activity | XP |
|---|---|
| Complete a lesson | 10 XP |
| Perfect score on a quiz | 20 XP |
| Complete a checkpoint | 25 XP |
| Complete a Boss Challenge | 50 XP |
| Daily login streak (per day) | 5 XP |
| 7-day streak bonus | 25 XP |
| First lesson of the day | 5 XP bonus |

### Level Thresholds

Use a progressively increasing XP curve. The user's **XP level** (1–50+) is separate from their **curriculum level** (1–4). XP levels are earned continuously; **Rank** is a title milestone tied to completing a full curriculum level.

```typescript
// lib/xp.ts
export const LEVEL_THRESHOLDS: number[] = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  850,   // Level 5
  1300,  // Level 6
  1900,  // Level 7
  2650,  // Level 8
  3600,  // Level 9
  4800,  // Level 10
  // Continue: each level ~30% more than the previous gap
];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXPProgressToNextLevel(xp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const level = getLevelFromXP(xp);
  const current = xp - LEVEL_THRESHOLDS[level - 1];
  const required = LEVEL_THRESHOLDS[level] - LEVEL_THRESHOLDS[level - 1];
  return { current, required, percentage: Math.floor((current / required) * 100) };
}
```

### Rank System (Curriculum Level Milestones)

**Ranks are awarded when a user completes an entire curriculum level** (i.e., passes the Boss Challenge). Each rank-up triggers a full-screen animated **Rank Up ceremony** — distinct from the normal lesson completion screen — celebrating the milestone with confetti, a rank badge reveal, and a motivational message.

```typescript
// lib/ranks.ts

export interface Rank {
  slug: string;
  title: string;
  icon: string;           // emoji badge displayed on profile and leaderboard
  color: string;          // Tailwind color class for rank badge styling
  unlockedByLevel: number; // curriculum level (1–4) that must be completed to earn this rank
  userLevelRequired: number; // approximate minimum XP level at time of unlock
  description: string;    // flavour text shown on rank-up screen
}

export const RANKS: Rank[] = [
  {
    slug: "novice",
    title: "Novice",
    icon: "🌱",
    color: "text-gray-500 bg-gray-100",
    unlockedByLevel: 0,    // starting rank — all new users
    userLevelRequired: 1,
    description: "Everyone starts somewhere. Your financial journey begins now.",
  },
  {
    slug: "apprentice",
    title: "Apprentice",
    icon: "📘",
    color: "text-green-600 bg-green-100",
    unlockedByLevel: 1,    // complete Level 1 — Money Awareness
    userLevelRequired: 10,
    description: "You understand the basics of money. The real learning starts here.",
  },
  {
    slug: "practitioner",
    title: "Practitioner",
    icon: "🏦",
    color: "text-blue-600 bg-blue-100",
    unlockedByLevel: 2,    // complete Level 2 — Financial Stability
    userLevelRequired: 20,
    description: "You can manage money with confidence. Banks and debt hold no mystery.",
  },
  {
    slug: "strategist",
    title: "Strategist",
    icon: "📈",
    color: "text-purple-600 bg-purple-100",
    unlockedByLevel: 3,    // complete Level 3 — Wealth Building
    userLevelRequired: 30,
    description: "You think in assets, not expenses. Wealth building is your game.",
  },
  {
    slug: "expert",
    title: "Expert",
    icon: "🧠",
    color: "text-red-600 bg-red-100",
    unlockedByLevel: 4,    // complete Level 4 — Advanced Thinking
    userLevelRequired: 40,
    description: "You see through financial traps, manage risk, and understand the system.",
  },
  {
    slug: "hero",
    title: "Financial Hero",
    icon: "🏆",
    color: "text-amber-600 bg-amber-100",
    unlockedByLevel: 5,    // complete the Final Hero Phase
    userLevelRequired: 50,
    description: "You've mastered financial literacy. You are the ArcWealth Hero.",
  },
];

export function getRankForCurriculumLevel(curriculumLevelCompleted: number): Rank {
  // Find the highest rank the user has earned
  return [...RANKS]
    .reverse()
    .find(r => r.unlockedByLevel <= curriculumLevelCompleted) ?? RANKS[0];
}
```

### Rank-Up Screen

When a user completes a Boss Challenge (or the Hero Phase), **before** returning to the curriculum map, show a dedicated full-screen `RankUpScreen` component:

- Animated confetti burst (use `canvas-confetti` package)
- Old rank badge → animated transition → new rank badge (scale + glow animation via Framer Motion)
- Display new rank title, icon, and description
- Show total XP earned, current XP level
- "Continue" button to proceed to the curriculum map
- The new rank should also be persisted to `user_profiles.rank` via a server action

```typescript
// components/learn/RankUpScreen.tsx
interface RankUpScreenProps {
  previousRank: Rank;
  newRank: Rank;
  xpEarned: number;
  totalXP: number;
  userLevel: number;
  onContinue: () => void;
}
```
  1900,  // Level 7
  2650,  // Level 8
### Lesson Unlock Logic

**Content access is strictly sequential.** A user can only access the textbook, interactive lesson, and glossary terms for a topic once the **previous topic** is fully completed. There is no free browsing ahead in the curriculum.

Specific rules:

- Level 1, Section 1, Lesson 1 (`1.1.1`) is always unlocked for new users — its textbook, lesson, and glossary terms are all immediately accessible
- When a topic is completed, **only the immediately next topic** is unlocked (its textbook, lesson, and related glossary terms become accessible)
- Textbook and glossary for a topic unlock **at the same time** as the lesson — they are gated together. A user cannot read the textbook or see glossary terms for a lesson they haven't unlocked yet
- Checkpoint quizzes unlock only when **all** lessons in that section are completed
- Boss Challenges unlock only when **all** sections (including all checkpoints) in that curriculum level are completed
- A user must score ≥ 70% on a checkpoint to unlock the next section
- A user must score ≥ 80% on a Boss Challenge to pass and trigger the Rank-Up sequence
- If a Boss Challenge is failed, the user may retry (costs hearts or a cooldown); no progression occurs until it is passed
- The `user_progress` table drives all unlock state. Never derive unlock state from XP or level alone — always query `user_progress`

---

## Project File Structure

```
arcwealth/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx                  # Main app shell with sidebar nav
│   │   ├── dashboard/page.tsx          # Home/dashboard with streak, XP bar, continue button
│   │   ├── learn/
│   │   │   ├── page.tsx                # Curriculum map (Duolingo-style path)
│   │   │   └── [topicId]/
│   │   │       ├── page.tsx            # Lesson router (redirects to lesson or quiz)
│   │   │       ├── lesson/page.tsx     # Duolingo-style interactive lesson
│   │   │       ├── textbook/page.tsx   # Textbook/reading view
│   │   │       └── quiz/page.tsx       # Quiz view
│   │   ├── glossary/
│   │   │   ├── page.tsx                # Glossary index (alphabetical + search)
│   │   │   └── [term]/page.tsx         # Individual term page
│   │   ├── profile/
│   │   │   ├── page.tsx                # User profile + stats
│   │   │   └── achievements/page.tsx   # Achievements page
│   │   └── leaderboard/page.tsx        # Weekly XP leaderboard
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── progress/route.ts
│   │   ├── xp/route.ts
│   │   └── glossary/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── learn/
│   │   ├── CurriculumMap.tsx           # Duolingo-style path with nodes
│   │   ├── LessonNode.tsx              # Individual topic node on the map
│   │   ├── LessonShell.tsx             # Wraps lesson with XP bar + hearts
│   │   ├── QuizQuestion.tsx            # Multiple choice, true/false, fill-in
│   │   ├── ProgressBar.tsx             # Top lesson progress bar
│   │   ├── ResultsScreen.tsx           # Post-lesson XP reward screen
│   │   └── RankUpScreen.tsx            # Full-screen rank-up ceremony (confetti + badge reveal)
│   ├── textbook/
│   │   ├── TextbookLayout.tsx
│   │   ├── ConceptBlock.tsx            # Highlighted key concept box
│   │   ├── RealWorldExample.tsx        # "In the Real World" callout
│   │   ├── DefinitionHighlight.tsx     # Inline term definition (links to glossary)
│   │   └── DiagramPlaceholder.tsx      # For charts and diagrams
│   ├── ui/
│   │   ├── XPBar.tsx                   # Animated XP progress bar
│   │   ├── StreakBadge.tsx             # Flame + streak count
│   │   ├── HeartDisplay.tsx            # Hearts remaining display
│   │   ├── LevelBadge.tsx             # User level badge
│   │   └── AchievementToast.tsx        # Pop-up when achievement earned
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── TopBar.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       └── ProfilePictureUpload.tsx    # Avatar upload → Supabase Storage (bucket: avatars)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client
│   │   └── middleware.ts               # Auth session refresh
│   ├── auth.ts                         # next-auth config
│   ├── xp.ts                           # XP/level calculation utilities
│   ├── ranks.ts                        # Rank definitions + getRankForCurriculumLevel()
│   ├── progress.ts                     # Progress unlock logic
│   └── curriculum.ts                   # Curriculum data / topic helpers
├── types/
│   ├── database.ts                     # Supabase generated types
│   ├── curriculum.ts                   # Curriculum-related types
│   └── user.ts                         # User/profile types
├── hooks/
│   ├── useProgress.ts
│   ├── useXP.ts
│   └── useStreak.ts
├── middleware.ts                        # Protect app routes
└── supabase/
    ├── migrations/                      # SQL migration files
    └── seed.ts                          # Seed curriculum data
```

---

## Authentication

Use **`next-auth` v5 (Auth.js)** with the Supabase adapter.

- Support: **Email/Password**, **Google OAuth**, and **Apple OAuth**
- Apple Sign In requires `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`, and a valid Apple Developer account with a Services ID and private key configured
- On first sign-in (any provider), create a `user_profiles` row and seed initial `user_progress` rows (all lessons = 'locked', except 1.1.1 = 'available'). Set initial `rank` to `'novice'`
- OAuth providers (Google, Apple) will provide a profile picture URL — store it in `user_profiles.avatar_url` on first sign-in. Email/password users will have no avatar by default and are prompted to upload one
- Protect all `/(app)/**` routes via `middleware.ts`
- Store JWT session. Include `userId` in the JWT token for easy server-side access

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/(app)")) {
    return Response.redirect(new URL("/login", req.url))
  }
})
```

### Profile Picture Upload

- Use **Supabase Storage** with a public bucket named `avatars`
- File path convention: `avatars/{userId}/avatar.{ext}`
- On upload, generate a public URL and update `user_profiles.avatar_url`
- Accept JPG, PNG, WEBP — max 5MB
- Show a circular cropper/preview before confirming upload (use `react-easy-crop` or similar)
- The `ProfilePictureUpload` component should be accessible from both the onboarding flow (email/password users) and the profile settings page
- RLS policy: users may only write to their own folder path (`avatars/{their_user_id}/*`)

```sql
-- Supabase Storage RLS for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

## Key Pages & Features

### 1. Curriculum Map (`/learn`)

- Render a **vertical scrollable path** of lesson nodes, similar to Duolingo
- Nodes are color-coded by status: locked (grey), available (blue/gold), completed (green), in-progress (animated pulse)
- Group nodes by Section with a section header banner
- Show Level banners as major milestones
- Clicking an available node navigates to `/learn/[topicId]`
- Locked nodes show a lock icon and tooltip explaining what to complete first

### 2. Duolingo-Style Lesson (`/learn/[topicId]/lesson`)

- Full-screen lesson experience
- Top bar: progress bar (steps completed / total), hearts display, XP earned so far, X to exit
- Each lesson has **5–8 "exercise cards"** cycling through question types:
  - **Multiple Choice** — pick the correct answer from 4 options
  - **True/False** — binary choice with explanation on reveal
  - **Fill in the Blank** — type or select the missing word
  - **Match Pairs** — drag-and-drop matching (term ↔ definition)
  - **Scenario Card** — read a short real-world scenario, answer a question
- After each answer: show ✅ correct / ❌ wrong with explanation. Wrong answers cost 1 heart.
- On lesson complete: animated XP reward screen showing XP earned, streak updated, any achievements unlocked

### 3. Textbook View (`/learn/[topicId]/textbook`)

- Clean reading layout with:
  - **Section header** with topic ID, title, level/section breadcrumb
  - **Key Concept boxes** (highlighted, bordered callouts)
  - **Definition highlights** — inline terms that are clickable and link to glossary
  - **Real World Example blocks** — styled differently with a 💡 or 🌍 icon
  - **Charts/Diagrams** — placeholder components (use Recharts for data charts)
  - **Summary / Key Takeaways** at the bottom
  - **"Start Lesson" CTA** button at the bottom linking to the interactive lesson

### 4. Glossary (`/glossary`)

- The glossary index page shows **all terms**, but individual term pages and their full definitions are **locked** until the topic that introduces that term is unlocked in the user's progress
- Locked terms display a greyed-out card with a 🔒 icon and the message "Complete [Topic X.X.X] to unlock this term"
- Unlocked terms show the full definition, example sentence, and related topics
- Search bar filters visible terms in real-time (locked terms can still appear in search results, just shown as locked)
- Each term links to its own page with full definition, example sentence, and related topics
- Terms highlighted in textbook content link back here

### 5. Quiz / Checkpoint (`/learn/[topicId]/quiz`)

- Timed (optional) quiz mode
- Multiple question types (same as lesson exercises)
- Shows score at end (X/Y correct)
- If score ≥ threshold (70% checkpoint, 80% boss): mark complete, award XP, unlock next topic
- If failed: allow retry after a cooldown or heart cost
- **After a Boss Challenge is passed**: do NOT immediately return to the curriculum map. Instead, trigger the full-screen `RankUpScreen` showing the user's new rank, then return to the map where the next curriculum level is now unlocked

### 6. Dashboard (`/dashboard`)

- Welcome back message with streak flame 🔥
- XP progress bar showing current level and XP to next level
- "Continue Learning" big CTA button (picks up where user left off)
- Recent achievements
- Daily goal progress
- Quick stats: total lessons completed, current streak, total XP

### 7. Profile (`/profile`)

- **Profile picture** (circular, editable — clicking it opens the `ProfilePictureUpload` component)
- Username + user XP level badge + **current Rank badge** (icon + rank title, styled with rank color)
- XP progress bar to next XP level
- XP history chart (last 30 days, using Recharts)
- Rank progression timeline — shows all ranks earned and when
- Achievements grid
- Full stats: total XP, lessons completed, streak record, join date
- Edit profile button (change username, update profile picture)

---

## Content JSON Structure (JSONB in Supabase)

### Textbook Content

```typescript
interface TextbookContent {
  type: "textbook";
  sections: Array<{
    heading?: string;
    blocks: Array<
      | { kind: "paragraph"; text: string }
      | { kind: "key_concept"; title: string; body: string }
      | { kind: "real_world_example"; title: string; body: string }
      | { kind: "definition"; term: string; definition: string }
      | { kind: "chart"; chartType: "bar" | "line" | "pie"; data: object; caption: string }
      | { kind: "callout"; icon: string; text: string }
      | { kind: "bullet_list"; items: string[] }
    >;
  }>;
  key_takeaways: string[];
}
```

### Lesson Exercises

```typescript
interface LessonContent {
  type: "duolingo_lesson";
  exercises: Array<
    | {
        kind: "multiple_choice";
        question: string;
        options: string[];
        correct_index: number;
        explanation: string;
      }
    | {
        kind: "true_false";
        statement: string;
        correct: boolean;
        explanation: string;
      }
    | {
        kind: "fill_blank";
        sentence: string;  // use ___ as the blank placeholder
        options: string[];
        correct_index: number;
        explanation: string;
      }
    | {
        kind: "match_pairs";
        pairs: Array<{ left: string; right: string }>;
      }
    | {
        kind: "scenario";
        scenario: string;
        question: string;
        options: string[];
        correct_index: number;
        explanation: string;
      }
  >;
}
```

---

## Gamification Details

### Hearts System

- Users start with 5 hearts ❤️
- Each wrong answer in a lesson costs 1 heart
- Hearts regenerate at 1 per 30 minutes (or can be refilled via achievements)
- If hearts reach 0, user must wait or watch an "ad" (placeholder)
- Show heart count in the top bar of every lesson

### Streak System

- Track `last_activity_date` on `user_profiles`
- If user completes ≥ 1 lesson today and completed one yesterday → increment streak
- If a day is missed → reset streak to 0 (with one "streak freeze" grace period)
- Display streak flame 🔥 with count everywhere in the UI

### Achievements System

Seed these achievements (add more as needed):

```typescript
const ACHIEVEMENTS = [
  { slug: "first_lesson", title: "First Step", description: "Complete your first lesson", icon: "🎯", xp_reward: 10 },
  { slug: "streak_7", title: "Week Warrior", description: "7-day learning streak", icon: "🔥", xp_reward: 50 },
  { slug: "streak_30", title: "Month Master", description: "30-day learning streak", icon: "💎", xp_reward: 200 },
  { slug: "rank_apprentice", title: "Apprentice", description: "Rank up to Apprentice by completing Level 1", icon: "📘", xp_reward: 100 },
  { slug: "rank_practitioner", title: "Practitioner", description: "Rank up to Practitioner by completing Level 2", icon: "🏦", xp_reward: 200 },
  { slug: "rank_strategist", title: "Strategist", description: "Rank up to Strategist by completing Level 3", icon: "📈", xp_reward: 300 },
  { slug: "rank_expert", title: "Expert", description: "Rank up to Expert by completing Level 4", icon: "🧠", xp_reward: 400 },
  { slug: "hero", title: "ArcWealth Hero", description: "Complete the full ArcWealth curriculum", icon: "🏆", xp_reward: 1000 },
  { slug: "perfect_quiz", title: "Perfect Score", description: "Score 100% on a quiz", icon: "⭐", xp_reward: 25 },
  { slug: "xp_500", title: "XP Grinder", description: "Earn 500 total XP", icon: "⚡", xp_reward: 0 },
  { slug: "profile_complete", title: "Face of Finance", description: "Upload a profile picture", icon: "📸", xp_reward: 10 },
];
```

---

## Styling Guidelines

- **Color palette**: Use a vibrant, teen-friendly palette. Suggested primary: `#4F46E5` (indigo), accent: `#F59E0B` (amber), success: `#10B981` (emerald), danger: `#EF4444` (red)
- **Typography**: Use `Inter` or `Plus Jakarta Sans` from Google Fonts
- **Tone**: Friendly, encouraging, never condescending. Use emojis sparingly but effectively
- **Mobile-first**: Design for mobile screens first, tablet and desktop as enhancements
- **Animations**: Framer Motion for XP bar fills, lesson completion screens, node unlock animations
- Lesson nodes on the curriculum map should have a slightly playful, rounded, "game-like" feel

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

AUTH_SECRET=your_nextauth_secret

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Apple OAuth
AUTH_APPLE_ID=your_apple_services_id              # e.g. com.yourcompany.arcwealth
AUTH_APPLE_SECRET=your_apple_private_key_jwt       # Generated from Apple Developer key

NEXTAUTH_URL=http://localhost:3000
```

---

## Implementation Order (Suggested)

Build in this order to get a working MVP quickly:

1. **Project setup** — Next.js, Tailwind, shadcn/ui, Supabase client, Supabase Storage bucket (`avatars`)
2. **Database + seed** — Run migrations, seed `topics` table with all 180 lessons
3. **Auth** — next-auth with email/password + Google + Apple; user profile creation on signup; profile picture upload flow
4. **Curriculum map** — Static map with all nodes, locked/unlocked states
5. **XP + Level + Rank system** — Core utilities (`xp.ts`, `ranks.ts`), database functions
6. **Textbook view** — Render textbook JSONB content for at least 5 sample lessons
7. **Lesson exercises** — At least 3 exercise types (multiple choice, true/false, fill blank)
8. **Progress tracking** — Mark lessons complete, strict sequential unlock, award XP
9. **Rank-Up screen** — `RankUpScreen` component triggered on Boss Challenge completion
10. **Dashboard** — Streak, XP bar, rank badge, continue CTA
11. **Glossary** — Full glossary with search, locked/unlocked states per user progress
12. **Profile + achievements** — Stats page, rank timeline, achievement grid, profile picture upload
13. **Quiz/checkpoint mode** — Score gating, retry logic, rank-up trigger
14. **Polish** — Animations, sounds, responsive design, hearts system, leaderboard

---

## Additional Notes & Constraints

- All user-facing text should be **appropriate for teenagers (13–18)**; keep explanations clear and relatable with real-world teen examples (e.g., "You just got your first job at a coffee shop...")
- Every lesson topic should have **both** a textbook entry and a Duolingo-style lesson — they cover the same material in different formats
- The glossary should be populated from all bolded/key terms that appear across the textbook content
- Do not use any paid third-party services beyond Supabase
- Ensure all pages are **server-side rendered or statically generated** where possible for performance (use Next.js `generateStaticParams` for textbook pages)
- Use **Supabase Realtime** for the leaderboard to show live XP updates
- All database mutations (awarding XP, marking complete) should be done via **server actions** or **API routes**, never directly from client components
- Include loading skeletons (shadcn Skeleton) for all data-fetching components
