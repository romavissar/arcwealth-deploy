import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Brain,
  BookOpenCheck,
  Crown,
  Flame,
  GraduationCap,
  HeartPulse,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sprout,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingScrollAnimator } from "@/components/landing/LandingScrollAnimator";
import { RotatingHeroLine } from "@/components/landing/RotatingHeroLine";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAppUserId } from "@/lib/auth/server-user";

const painPoints = [
  {
    title: "Financial education feels abstract",
    body: "Most students memorize terms but never build daily money decision skills they can actually use.",
  },
  {
    title: "Motivation fades after week one",
    body: "Without momentum systems, students drop off before saving, budgeting, and investing habits stick.",
  },
  {
    title: "Teachers need visibility, not spreadsheets",
    body: "Classroom finance should be easy to coordinate with clear progress signals and timely nudges.",
  },
] as const;

const coreFeatures = [
  {
    title: "Gamified progression engine",
    body: "XP, streaks, hearts, ranks, and achievements turn consistency into momentum students want to keep.",
    icon: Trophy,
  },
  {
    title: "Learn, quiz, and textbook in one flow",
    body: "Lessons, interactive quizzes, and deeper textbook content connect in one focused learning journey.",
    icon: BookOpenCheck,
  },
  {
    title: "Glossary that unlocks with mastery",
    body: "Students unlock terms as they progress, building vocabulary exactly when it becomes useful.",
    icon: Sparkles,
  },
  {
    title: "Classroom and teacher workflows",
    body: "Teachers can organize classes, monitor student movement, and send nudges that keep everyone on track.",
    icon: GraduationCap,
  },
  {
    title: "Friendly competition with leaderboards",
    body: "Daily and weekly ranking adds accountability and healthy challenge without sacrificing comprehension.",
    icon: Users,
  },
  {
    title: "Profile and progress visibility",
    body: "Students see growth over time with clear rank and XP signals that reinforce long-term learning behavior.",
    icon: Target,
  },
] as const;

const learningLoop = [
  {
    title: "Learn fast",
    body: "Short, focused concepts make money topics easier to absorb.",
    icon: Sparkles,
  },
  {
    title: "Practice actively",
    body: "Scenario-driven quizzes push understanding beyond memorization.",
    icon: BookOpenCheck,
  },
  {
    title: "Level up",
    body: "XP, hearts, and streak mechanics reward consistency every day.",
    icon: Flame,
  },
  {
    title: "Apply in class and life",
    body: "Teachers align learning, students build real-world confidence.",
    icon: GraduationCap,
  },
] as const;

const securityPillars = [
  "Signed session cookies with HttpOnly protections and secure production defaults.",
  "Optional two-factor authentication with encrypted TOTP secrets.",
  "Argon2id password hashing and token hashing for verification and reset flows.",
  "Middleware-protected app routes with role-aware access controls.",
] as const;

const schoolDeliverables = [
  "Structured classroom cohorts and student progress visibility",
  "Lesson assignment workflows with teacher nudges and updates",
  "Gamified engagement layer students actually come back to",
  "GDPR-aligned product design and EU DPA-ready institutional workflows",
] as const;

const rotatingPhrases = [
  "Build better money habits",
  "Turn streaks into confidence",
  "Climb from Novice to Hero",
  "Learn with game-level momentum",
] as const;

const rankJourney = [
  {
    slug: "novice",
    title: "Novice",
    levelTag: "Level 1+",
    description: "You start your journey and build your first money reflexes.",
    Icon: Sprout,
    tone: "from-slate-500/20 to-slate-400/5 text-slate-700 dark:text-slate-200",
  },
  {
    slug: "apprentice",
    title: "Apprentice",
    levelTag: "Level 10+",
    description: "You master the core money vocabulary and first spending patterns.",
    Icon: BookOpenText,
    tone: "from-emerald-500/20 to-emerald-400/5 text-emerald-700 dark:text-emerald-300",
  },
  {
    slug: "practitioner",
    title: "Practitioner",
    levelTag: "Level 20+",
    description: "You can apply financial thinking in real scenarios with confidence.",
    Icon: Landmark,
    tone: "from-blue-500/20 to-blue-400/5 text-blue-700 dark:text-blue-300",
  },
  {
    slug: "strategist",
    title: "Strategist",
    levelTag: "Level 30+",
    description: "You think long-term and connect habits to wealth outcomes.",
    Icon: TrendingUp,
    tone: "from-violet-500/20 to-violet-400/5 text-violet-700 dark:text-violet-300",
  },
  {
    slug: "expert",
    title: "Expert",
    levelTag: "Level 40+",
    description: "You see trade-offs clearly and avoid high-cost financial mistakes.",
    Icon: Brain,
    tone: "from-rose-500/20 to-rose-400/5 text-rose-700 dark:text-rose-300",
  },
  {
    slug: "hero",
    title: "Financial Hero",
    levelTag: "Level 50+",
    description: "You lead with mastery and make high-quality financial decisions consistently.",
    Icon: Crown,
    tone: "from-amber-500/25 to-amber-300/5 text-amber-700 dark:text-amber-300",
  },
] as const;

export default async function HomePage() {
  const userId = await getAppUserId();
  const primaryHref = userId ? "/dashboard" : "/sign-in";
  const primaryLabel = userId ? "Open Student App" : "Get Started Free";

  return (
    <div className="aw-landing-page relative min-h-screen overflow-x-clip bg-aw-bg-page text-aw-text">
      <LandingScrollAnimator />
      <div className="aw-landing-aurora aw-landing-aurora--one" aria-hidden />
      <div className="aw-landing-aurora aw-landing-aurora--two" aria-hidden />

      <header className="sticky top-0 z-40 border-b border-aw-border/60 bg-aw-bg-page/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            ArcWealth
          </Link>
          <nav className="hidden items-center gap-2 text-sm text-aw-muted md:flex">
            <a href="#features" className="aw-nav-pill">
              Features
            </a>
            <a href="#schools" className="aw-nav-pill">
              Schools
            </a>
            <a href="#security" className="aw-nav-pill">
              Security
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="aw-header-cta aw-header-cta--secondary">
              <Link href="/credentials/register?track=school">Request School Demo</Link>
            </Button>
            <Button asChild size="sm" className="aw-header-cta aw-header-cta--primary">
              <Link href={primaryHref}>{userId ? "Open App" : "Sign In"}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="aw-landing-grid-mask" aria-hidden />
          <div className="aw-light-trail" aria-hidden />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="aw-reveal-up space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-aw-border bg-aw-bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-aw-muted">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Duolingo-style finance mastery for teens
              </div>
              <div className="space-y-5">
                <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Money skills that students remember.
                  <span className="block bg-gradient-to-r from-primary via-indigo-500 to-amber-500 bg-clip-text text-transparent">
                    Outcomes schools can actually track.
                  </span>
                </h1>
                <p className="text-base font-semibold text-primary sm:text-lg">
                  <RotatingHeroLine phrases={[...rotatingPhrases]} />
                </p>
                <p className="max-w-2xl text-lg leading-relaxed text-aw-muted">
                  ArcWealth transforms financial education from passive theory into active daily progress. Students build
                  real confidence through gamified lessons, while teachers gain classroom-level visibility and control.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="aw-cta-glow min-h-11">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-h-11">
                  <Link href="/credentials/register?track=school">Book a School Demo</Link>
                </Button>
              </div>
              <p className="text-sm text-aw-muted">
                Built with security-first architecture and GDPR-aligned data practices for modern classrooms.
              </p>
            </div>

            <aside className="aw-reveal-up aw-delay-1">
              <div className="relative overflow-hidden rounded-3xl border border-aw-border bg-aw-bg-card/80 p-6 shadow-xl backdrop-blur">
                <div className="aw-landing-shine" aria-hidden />
                <div className="space-y-5">
                  <h2 className="text-xl font-bold">The ArcWealth engagement engine</h2>
                  <div className="space-y-3">
                    <div className="aw-stat-card">
                      <span className="aw-stat-label">XP momentum</span>
                      <strong className="aw-stat-value">+1240 XP</strong>
                    </div>
                    <div className="aw-stat-card">
                      <span className="aw-stat-label">Active streak</span>
                      <strong className="aw-stat-value inline-flex items-center gap-1">
                        31 days <Flame className="h-4 w-4 text-amber-500" />
                      </strong>
                    </div>
                    <div className="aw-stat-card">
                      <span className="aw-stat-label">Current rank</span>
                      <strong className="aw-stat-value">Strategist</strong>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-aw-border/70 bg-aw-bg-page/70 p-4">
                    <p className="text-sm text-aw-muted">
                      Students learn, practice, and level up in one loop. Teachers see who is progressing, who is stuck,
                      and where to intervene quickly.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="aw-reveal-up mb-8 max-w-3xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">ArcWealth solves the adoption gap</h2>
              <p className="text-aw-muted">
                We designed ArcWealth around the real friction points that make financial literacy programs fail.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {painPoints.map((item, index) => (
                <article key={item.title} className={`aw-reveal-up aw-delay-${index + 1} aw-art-card rounded-2xl border border-aw-border bg-aw-bg-card/80 p-5 shadow-sm`}>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-aw-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="aw-scroll-target px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="aw-reveal-up mb-8 max-w-3xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything students and schools need, in one platform</h2>
              <p className="text-aw-muted">
                ArcWealth combines gamified learning mechanics with structured educational delivery, so engagement and rigor can
                coexist, including rank progression from Novice to Financial Hero.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coreFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className={`aw-reveal-up aw-delay-${(index % 3) + 1} aw-art-card aw-art-card--feature group rounded-2xl border border-aw-border bg-aw-bg-card/75 p-5 shadow-sm transition-all`}>
                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-aw-muted">{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl rounded-3xl border border-aw-border bg-aw-bg-card/80 p-6 shadow-xl sm:p-8">
            <div className="aw-reveal-up mb-8 max-w-3xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The gamified learning loop</h2>
              <p className="text-aw-muted">
                ArcWealth keeps students in motion through short wins, visible progress, and meaningful milestones.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {learningLoop.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className={`aw-reveal-up aw-delay-${index + 1} aw-art-card rounded-2xl border border-aw-border bg-aw-bg-page/80 p-5`}>
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                    <p className="text-sm text-aw-muted">{step.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="aw-rank-orb" aria-hidden />
          <div className="mx-auto w-full max-w-7xl">
            <div className="aw-reveal-up mb-8 max-w-3xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Feature spotlight: Novice to Financial Hero progression</h2>
              <p className="text-aw-muted">
                Every rank marks a deeper level of financial mastery. ArcWealth takes learners step-by-step from first money
                lessons to elite long-term decision making.
              </p>
            </div>
            <div className="aw-rank-line mb-6" aria-hidden />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rankJourney.map((rank, index) => {
                const Icon = rank.Icon;
                return (
                  <article key={rank.slug} className={`aw-reveal-up aw-delay-${(index % 4) + 1} aw-art-card aw-rank-card rounded-2xl border border-aw-border bg-aw-bg-card/80 p-5`}>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full border border-aw-border/80 bg-aw-bg-page/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-aw-muted">
                        {rank.levelTag}
                      </span>
                      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${rank.tone}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{rank.title}</h3>
                    <p className="text-sm leading-relaxed text-aw-muted">{rank.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="schools" className="aw-scroll-target px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="aw-reveal-up rounded-3xl border border-aw-border bg-aw-bg-card/80 p-6 shadow-lg sm:p-8">
              <h2 className="mb-3 text-3xl font-bold tracking-tight">Built for schools and teaching teams</h2>
              <p className="mb-6 text-aw-muted">
                Deliverables-focused rollout for institutions that want measurable student progress, not just logins.
              </p>
              <ul className="space-y-3">
                {schoolDeliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-aw-muted">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <BadgeCheck className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild size="lg" variant="outline" className="min-h-11">
                  <Link href="/credentials/register?track=school">
                    Request School Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div id="security" className="aw-scroll-target aw-reveal-up aw-delay-2 rounded-3xl border border-aw-border bg-aw-bg-card/85 p-6 shadow-lg sm:p-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-aw-border bg-aw-bg-page/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-aw-muted">
                <LockKeyhole className="h-4 w-4 text-primary" />
                High-tier security foundations
              </div>
              <h3 className="mb-3 text-2xl font-bold">Trust and safety by architecture</h3>
              <p className="mb-5 text-sm leading-relaxed text-aw-muted">
                ArcWealth is built with practical, production-grade safeguards for account security and route protection, plus
                institutional privacy posture aligned for GDPR and EU DPA workflows.
              </p>
              <ul className="space-y-3">
                {securityPillars.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-aw-muted">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="aw-reveal-up mx-auto w-full max-w-7xl rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-indigo-500/10 to-amber-400/15 p-8 shadow-xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Give students a financial future they can build themselves</h2>
                <p className="mt-3 text-aw-muted">
                  ArcWealth combines motivation design, curriculum structure, and school-ready controls into one platform.
                  Start as a student or launch as a school partner.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="aw-cta-glow min-h-11">
                  <Link href={primaryHref}>{primaryLabel}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-h-11">
                  <Link href="/credentials/register?track=school">Talk to ArcWealth for Schools</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-aw-border bg-aw-bg-card/60 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-aw-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" />
            ArcWealth - Learn money. Build wealth.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#features" className="aw-nav-pill aw-nav-pill--footer">
              Features
            </a>
            <a href="#schools" className="aw-nav-pill aw-nav-pill--footer">
              Schools
            </a>
            <a href="#security" className="aw-nav-pill aw-nav-pill--footer">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
