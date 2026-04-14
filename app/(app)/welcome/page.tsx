import { Compass, GraduationCap, Sparkles, Target } from "lucide-react";
import { redirect } from "next/navigation";
import { startTutorialAndGoAction, getMyTutorialState, skipTutorialAndGoAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Follow your momentum",
    description: "Track streaks, XP, and rank from one place so your daily progress is always visible.",
    icon: Sparkles,
  },
  {
    title: "Jump straight into lessons",
    description: "Use your dashboard shortcuts to continue the next lesson and textbook reading in one click.",
    icon: GraduationCap,
  },
  {
    title: "Stay focused on the next win",
    description: "ArcWealth highlights what matters now, so you can learn faster without hunting through menus.",
    icon: Target,
  },
];

export default async function WelcomePage() {
  const state = await getMyTutorialState();
  if (!state) redirect("/sign-in");
  if (!state.shouldShowTutorial) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6">
      <section className="rounded-2xl border border-indigo-500/45 bg-gradient-to-br from-indigo-100/80 via-white to-amber-50 p-6 shadow-sm dark:border-indigo-500/50 dark:from-indigo-900/30 dark:via-gray-900 dark:to-gray-900">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          Welcome to ArcWealth
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Quick tour before you begin</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-700 dark:text-gray-300">
          We will show you around in under a minute, then drop you right into your next lesson.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">{card.title}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{card.description}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Start the guided tour now, or skip and explore at your own pace.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <form action={skipTutorialAndGoAction}>
              <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                Skip for now
              </Button>
            </form>
            <form action={startTutorialAndGoAction}>
              <Button type="submit" className="w-full sm:w-auto">
                Start tour
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
