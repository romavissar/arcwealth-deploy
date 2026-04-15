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

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type PanelSize = {
  width: number;
  height: number;
};

type ViewportBounds = {
  width: number;
  height: number;
  padding: number;
  bottomPadding: number;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard-top-metrics",
    route: "/dashboard",
    selector: "[data-tour-id='top-metrics-summary']",
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

function expandRect(rect: Rect, padding: number): Rect {
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function getIntersectionArea(a: Rect, b: Rect): number {
  const overlapLeft = Math.max(a.left, b.left);
  const overlapTop = Math.max(a.top, b.top);
  const overlapRight = Math.min(a.left + a.width, b.left + b.width);
  const overlapBottom = Math.min(a.top + a.height, b.top + b.height);
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);
  return overlapWidth * overlapHeight;
}

function getRectCenterDistance(a: Rect, b: Rect): number {
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  return Math.hypot(ax - bx, ay - by);
}

function clampCandidate(candidate: { top: number; left: number }, panelSize: PanelSize, viewport: ViewportBounds): Rect {
  const maxTop = Math.max(viewport.padding, viewport.height - panelSize.height - viewport.bottomPadding);
  const maxLeft = Math.max(viewport.padding, viewport.width - panelSize.width - viewport.padding);
  return {
    top: clamp(candidate.top, viewport.padding, maxTop),
    left: clamp(candidate.left, viewport.padding, maxLeft),
    width: panelSize.width,
    height: panelSize.height,
  };
}

function computePanelPosition(anchorRect: AnchorRect | null, panelSize: PanelSize, viewport: ViewportBounds): { top: number; left: number } {
  if (!anchorRect) {
    return { top: viewport.padding, left: viewport.padding };
  }

  const gap = 12;
  const noFlyZone = expandRect(anchorRect, 14);
  const anchorRight = anchorRect.left + anchorRect.width;
  const anchorBottom = anchorRect.top + anchorRect.height;
  const anchorCenterY = anchorRect.top + anchorRect.height / 2;
  const candidates = [
    { top: anchorBottom + gap, left: anchorRect.left }, // below-left
    { top: anchorBottom + gap, left: anchorRect.left + anchorRect.width / 2 - panelSize.width / 2 }, // below-center
    { top: anchorRect.top - panelSize.height - gap, left: anchorRect.left }, // above-left
    { top: anchorRect.top - panelSize.height - gap, left: anchorRect.left + anchorRect.width / 2 - panelSize.width / 2 }, // above-center
    { top: anchorCenterY - panelSize.height / 2, left: anchorRight + gap }, // right-middle
    { top: anchorCenterY - panelSize.height / 2, left: anchorRect.left - panelSize.width - gap }, // left-middle
    { top: viewport.padding, left: viewport.padding }, // emergency fallback
  ];

  let bestCandidate: { rect: Rect; overlap: number; distance: number } | null = null;
  for (const candidate of candidates) {
    const rect = clampCandidate(candidate, panelSize, viewport);
    const overlap = getIntersectionArea(rect, noFlyZone);
    if (overlap === 0) {
      return { top: rect.top, left: rect.left };
    }
    const distance = getRectCenterDistance(rect, anchorRect);
    if (!bestCandidate || overlap < bestCandidate.overlap || (overlap === bestCandidate.overlap && distance > bestCandidate.distance)) {
      bestCandidate = { rect, overlap, distance };
    }
  }

  return bestCandidate ? { top: bestCandidate.rect.top, left: bestCandidate.rect.left } : { top: viewport.padding, left: viewport.padding };
}

function getAnchorRect(selector: string): AnchorRect | null {
  const node = document.querySelector(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
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
  const hasAutoScrolledStep = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    if (typeof window === "undefined") return { top: 96, left: 16, width: 360 };
    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const mobileNavNode = document.querySelector("[aria-label='Mobile navigation']");
    const mobileNavRect = mobileNavNode?.getBoundingClientRect();
    const mobileNavHeight = mobileNavRect && mobileNavRect.height > 0 ? mobileNavRect.height : 0;
    const bottomPadding = padding + mobileNavHeight;
    const panelWidth = Math.min(360, Math.max(280, viewportWidth - padding * 2));
    const panelHeight = Math.min(320, Math.max(260, viewportHeight - (padding * 2 + mobileNavHeight)));
    const { top, left } = computePanelPosition(anchorRect, { width: panelWidth, height: panelHeight }, {
      width: viewportWidth,
      height: viewportHeight,
      padding,
      bottomPadding,
    });
    return { top, left, width: panelWidth };
  }, [anchorRect]);

  const updateAnchorRect = useCallback(() => {
    if (!isOpen || !step) return;
    setAnchorRect(getAnchorRect(step.selector));
  }, [isOpen, step]);

  const scheduleAnchorRectUpdate = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      updateAnchorRect();
    });
  }, [updateAnchorRect]);

  useEffect(() => {
    if (!isOpen) {
      setStepId(null);
      setAnchorRect(null);
      hasAutoScrolledStep.current = null;
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
    updateAnchorRect();
    const handleViewportChange = () => scheduleAnchorRectUpdate();
    window.addEventListener("resize", handleViewportChange, { passive: true });
    window.addEventListener("scroll", handleViewportChange, { passive: true });
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isOpen, scheduleAnchorRectUpdate, step, updateAnchorRect]);

  useEffect(() => {
    if (!isOpen || !step || !anchorRect) return;
    if (hasAutoScrolledStep.current === step.id) return;
    hasAutoScrolledStep.current = step.id;
    const target = document.querySelector(step.selector) as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const mobileNavNode = document.querySelector("[aria-label='Mobile navigation']");
    const mobileNavRect = mobileNavNode?.getBoundingClientRect();
    const mobileNavHeight = mobileNavRect && mobileNavRect.height > 0 ? mobileNavRect.height : 0;
    const estimatedPanelHeight = Math.min(320, Math.max(260, window.innerHeight - (32 + mobileNavHeight)));
    const targetTopBuffer = 96;
    const targetBottomBuffer = Math.max(180, mobileNavHeight + estimatedPanelHeight * 0.55);
    const availableSpaceAbove = rect.top - 16;
    const availableSpaceBelow = window.innerHeight - mobileNavHeight - 16 - rect.bottom;
    const hasPanelRoom = availableSpaceAbove >= 72 || availableSpaceBelow >= Math.min(220, estimatedPanelHeight * 0.6);
    const isVisibleEnough = rect.top >= targetTopBuffer && rect.bottom <= window.innerHeight - targetBottomBuffer && hasPanelRoom;
    if (isVisibleEnough) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [anchorRect, isOpen, step]);

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

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !isOpen || !step) return;
    const matches = document.querySelectorAll(step.selector);
    if (matches.length === 0) {
      console.warn(`[GuidedTour] Missing selector for step "${step.id}": ${step.selector}`);
      return;
    }
    const rect = matches[0].getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn(`[GuidedTour] Zero-size selector for step "${step.id}": ${step.selector}`);
    }
  }, [isOpen, step]);

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
        style={{
          top: panelPosition.top,
          left: panelPosition.left,
          width: panelPosition.width,
          maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1rem)",
          overflowY: "auto",
        }}
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
          <Button type="button" variant="secondary" className="min-h-11" onClick={closeWithSkip} disabled={isSaving} aria-label="Skip tutorial">
            Skip
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={goToPreviousStep}
            disabled={stepIndex === 0 || isSaving}
            aria-label="Previous tutorial step"
          >
            Back
          </Button>
          {!isLastStep ? (
            <Button type="button" className="ml-auto min-h-11" onClick={goToNextStep} disabled={isSaving} aria-label="Next tutorial step">
              Next
            </Button>
          ) : (
            <Button type="button" className="ml-auto min-h-11" onClick={closeWithComplete} disabled={isSaving} aria-label="Finish tutorial">
              Done
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
