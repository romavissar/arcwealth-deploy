"use client";

import { useEffect } from "react";

export function LandingScrollAnimator() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".aw-reveal-up"));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("aw-in-view");
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    for (const node of nodes) observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return null;
}
