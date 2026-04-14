"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { completeTutorialAction, skipTutorialAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";

type GuidedTourProps = {
  enabled: boolean;
};

type TourStep = {
  id: string;
  route: string;
  selector: string;
  title: string;
  body: string;
};

type AnchorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard-top-metrics",
    route: "/dashboard",
    selector: "[data-tour-id='top-metrics']",
    title: "Hearts, streaks, and rank at a glance",
    body: "This top bar tracks your hearts, current streak, and rank so you always know your live progress before starting a lesson.",
  },
  {
    id: "dashboard-momentum",
    route: "/dashboard",
    selector: "[data-tour-id='dashboard-momentum']",
    title: "Dashboard momentum view",
    body: "Here you can see streak consistency and weekly pace. Use this section to decide what to focus on today.",
  },
  {
    id: "dashboard-next-actions",
    route: "/dashboard",
    selector: "[data-tour-id='next-actions']",
    title: "Your next action shortcuts",
    body: "These buttons are your fastest path into Learn and Textbook. Next, we will walk through Learn.",
  },
  {
    id: "learn-overview",
    route: "/learn",
    selector: "[data-tour-id='learn-overview']",
    title: "Learn: interactive challenge flow",
    body: "Learn is where you practice through guided missions and checkpoints. Progress here boosts XP and unlocks new lessons.",
  },
  {
    id: "learn-map",
    route: "/learn",
    selector: "[data-tour-id='learn-map']",
    title: "How Learn works",
    body: "This curriculum map shows locked, available, in-progress, and completed lessons so you always know what unlocks next.",
  },
  {
    id: "textbook-overview",
    route: "/textbook",
    selector: "[data-tour-id='textbook-overview']",
    title: "Textbook: concept mastery",
    body: "Textbook gives full explanations and examples behind each lesson so you understand the why, not only the answer.",
  },
  {
    id: "textbook-map",
    route: "/textbook",
    selector: "[data-tour-id='textbook-map']",
    title: "How Textbook works",
    body: "Open module sections to read lessons in sequence and track your reading coverage as you go.",
  },
  {
    id: "glossary-overview",
    route: "/glossary",
    selector: "[data-tour-id='glossary-overview']",
    title: "Glossary quick definitions",
    body: "Use Glossary to quickly review terms while studying. It is ideal for fast concept refresh before quizzes.",
  },
  {
    id: "leaderboard-overview",
    route: "/leaderboard",
    selector: "[data-tour-id='leaderboard-overview']",
    title: "Leaderboard and competition",
    body: "Leaderboard ranks learners by XP so you can compare progress and stay motivated.",
  },
  {
    id: "profile-overview",
    route: "/profile",
    selector: "[data-tour-id='profile-overview']",
    title: "Profile snapshot",
    body: "Your profile summarizes level, weekly XP, streak, and overall performance in one place.",
  },
  {
    id: "profile-progress",
    route: "/profile",
    selector: "[data-tour-id='profile-progress']",
    title: "Profile progress details",
    body: "This section breaks down your module and achievement progress. You are ready to keep going.",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getAnchorRect(selector: string): AnchorRect | null {
  const node = document.querySelector(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

function getFallbackStepForPath(currentPath: string): TourStep {
  return TOUR_STEPS.find((item) => item.route === currentPath) ?? TOUR_STEPS[0];
}

function buildStepUrl(targetStep: TourStep): string {
  return `${targetStep.route}?tour=1&step=${targetStep.id}`;
}

export function GuidedTour({ enabled }: GuidedTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [stepId, setStepId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const missingAnchorHandledForStep = useRef<string | null>(null);

  const hasTourQuery = searchParams.get("tour") === "1";
  const isOpen = enabled && hasTourQuery;
  const step = useMemo(() => TOUR_STEPS.find((item) => item.id === stepId) ?? null, [stepId]);
  const stepIndex = step ? TOUR_STEPS.findIndex((item) => item.id === step.id) : -1;
  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  const goToStep = useCallback((targetStep: TourStep, mode: "push" | "replace" = "push") => {
    const url = buildStepUrl(targetStep);
    if (mode === "replace") {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  }, [router]);

  const panelPosition = useMemo(() => {
    if (!anchorRect || typeof window === "undefined") return { top: 96, left: 24 };
    const panelWidth = 360;
    const panelHeight = 280;
    const padding = 16;
    const viewportTop = window.scrollY;
    const viewportBottom = window.scrollY + window.innerHeight;
    const belowTop = anchorRect.top + anchorRect.height + 12;
    const aboveTop = anchorRect.top - panelHeight - 12;
    const preferredTop = belowTop + panelHeight > viewportBottom - padding ? aboveTop : belowTop;
    const maxTop = viewportBottom - panelHeight - padding;
    const top = clamp(preferredTop, viewportTop + padding, maxTop);
    const maxLeft = window.scrollX + window.innerWidth - panelWidth - padding;
    const left = clamp(anchorRect.left, window.scrollX + padding, maxLeft);
    return { top, left };
  }, [anchorRect]);

  useEffect(() => {
    if (!isOpen) {
      setStepId(null);
      return;
    }
    const queryStepId = searchParams.get("step");
    const queryStep = queryStepId ? TOUR_STEPS.find((item) => item.id === queryStepId) : null;
    const active = queryStep ?? getFallbackStepForPath(pathname);
    setStepId(active.id);
    if (!queryStep || queryStep.route !== pathname) {
      goToStep(active, "replace");
    }
  }, [goToStep, isOpen, pathname, searchParams]);

  useEffect(() => {
    if (!isOpen || !step) return;
    const update = () => {
      const rect = getAnchorRect(step.selector);
      setAnchorRect(rect);
      if (rect) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: Math.max(0, rect.top - 96), behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen || !step || anchorRect || isSaving) return;
    if (missingAnchorHandledForStep.current === step.id) return;
    missingAnchorHandledForStep.current = step.id;
    const timer = window.setTimeout(() => {
      const next = TOUR_STEPS[stepIndex + 1];
      if (next) goToStep(next, "replace");
    }, 650);
    return () => window.clearTimeout(timer);
  }, [anchorRect, goToStep, isOpen, isSaving, step, stepIndex]);

  useEffect(() => {
    if (anchorRect) {
      missingAnchorHandledForStep.current = null;
    }
  }, [anchorRect]);

  if (!isOpen || !step) return null;

  async function closeWithSkip() {
    setIsSaving(true);
    setError(null);
    const result = await skipTutorialAction();
    if (!result.ok) {
      setError(result.error);
      setIsSaving(false);
      return;
    }
    setStepId(null);
    setIsSaving(false);
    router.replace(pathname, { scroll: false });
    router.refresh();
  }

  async function closeWithComplete() {
    setIsSaving(true);
    setError(null);
    const result = await completeTutorialAction();
    if (!result.ok) {
      setError(result.error);
      setIsSaving(false);
      return;
    }
    setStepId(null);
    setIsSaving(false);
    router.replace("/dashboard", { scroll: false });
    router.refresh();
  }

  function goToPreviousStep() {
    if (stepIndex <= 0) return;
    goToStep(TOUR_STEPS[stepIndex - 1]);
  }

  function goToNextStep() {
    if (isLastStep) {
      void closeWithComplete();
      return;
    }
    const next = TOUR_STEPS[stepIndex + 1];
    if (next) goToStep(next);
  }

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label="Guided tutorial">
      <div className="absolute inset-0 bg-black/45" />

      {anchorRect && (
        <div
          className="pointer-events-none absolute rounded-2xl border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] transition-all duration-200"
          style={{
            top: anchorRect.top - 4,
            left: anchorRect.left - 4,
            width: anchorRect.width + 8,
            height: anchorRect.height + 8,
          }}
          aria-hidden="true"
        />
      )}

      <section
        className="absolute w-[calc(100vw-2rem)] max-w-[360px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        style={{ top: panelPosition.top, left: panelPosition.left, maxHeight: "calc(100vh - 2rem)", overflowY: "auto" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Step {stepIndex + 1} of {TOUR_STEPS.length}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{step.title}</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{step.body}</p>
        {error && (
          <p className="mt-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={closeWithSkip} disabled={isSaving} aria-label="Skip tutorial">
            Skip
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={stepIndex === 0 || isSaving}
            aria-label="Previous tutorial step"
          >
            Back
          </Button>
          {!isLastStep ? (
            <Button type="button" className="ml-auto" onClick={goToNextStep} disabled={isSaving} aria-label="Next tutorial step">
              Next
            </Button>
          ) : (
            <Button type="button" className="ml-auto" onClick={closeWithComplete} disabled={isSaving} aria-label="Finish tutorial">
              Done
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
