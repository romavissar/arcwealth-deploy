"use client";

import { useEffect, useMemo, useState } from "react";

type RotatingHeroLineProps = {
  phrases: string[];
  intervalMs?: number;
};

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RotatingHeroLine({ phrases, intervalMs = 2200 }: RotatingHeroLineProps) {
  const safePhrases = useMemo(() => phrases.filter((item) => item.trim().length > 0), [phrases]);
  const [index, setIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(getPrefersReducedMotion());
  }, []);

  useEffect(() => {
    if (safePhrases.length <= 1 || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safePhrases.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [safePhrases, intervalMs, prefersReducedMotion]);

  if (safePhrases.length === 0) return null;

  return (
    <span className="aw-rotator">
      <span key={safePhrases[index]} className="aw-rotator-item">
        {safePhrases[index]}
      </span>
    </span>
  );
}
