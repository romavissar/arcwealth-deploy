"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Lock, Play } from "lucide-react";
import { getLessonDescription, getLessonTitle, LEVEL_NAMES } from "@/lib/curriculum";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Topic } from "@/types/curriculum";

type TopicRow = Topic & { topic_id: string; topic_type: string; order_index: number };
type ProgressStatus = "locked" | "available" | "in_progress" | "completed";

interface LessonPathNode {
  pathIndex: number;
  topicId: string;
  moduleNumber: number;
  moduleTitle: string;
  title: string;
  description: string;
  status: ProgressStatus;
  score: number | null;
  playHref: string;
}

interface CurriculumMapProps {
  topics: TopicRow[];
  progressMap: Map<string, ProgressStatus>;
  scoreMap: Map<string, number | null>;
}

export function CurriculumMap({ topics, progressMap, scoreMap }: CurriculumMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [spineMetrics, setSpineMetrics] = useState({ top: 0, bottom: 0, progress: 0 });

  const lessonNodes = useMemo<LessonPathNode[]>(() => {
    return [...topics]
      .sort((a, b) => a.order_index - b.order_index)
      .map((topic, index) => {
        const status = progressMap.get(topic.topic_id) ?? "locked";
        return {
          pathIndex: index + 1,
          topicId: topic.topic_id,
          moduleNumber: topic.level_number,
          moduleTitle: LEVEL_NAMES[topic.level_number as keyof typeof LEVEL_NAMES] ?? `Module ${topic.level_number}`,
          title: getLessonTitle(topic.topic_id),
          description: getLessonDescription(topic.topic_id) ?? topic.description ?? "Continue your journey on this lesson.",
          status,
          score: scoreMap.get(topic.topic_id) ?? null,
          playHref: `/learn/${topic.topic_id}/lesson`,
        };
      });
  }, [topics, progressMap, scoreMap]);

  const activeLevel = useMemo(() => {
    const firstActionable = lessonNodes.find((node) => node.status === "in_progress" || node.status === "available");
    if (firstActionable) return firstActionable.topicId;
    return lessonNodes.at(-1)?.topicId ?? null;
  }, [lessonNodes]);

  useEffect(() => {
    const measureSpine = () => {
      const pathEl = pathRef.current;
      if (!pathEl || lessonNodes.length === 0) return;

      const firstNode = rowRefs.current[lessonNodes[0].topicId];
      const lastNode = rowRefs.current[lessonNodes[lessonNodes.length - 1].topicId];
      if (!firstNode || !lastNode) return;

      const firstCenter = firstNode.offsetTop + firstNode.offsetHeight / 2;
      const lastCenter = lastNode.offsetTop + lastNode.offsetHeight / 2;
      const firstIncompleteIndex = lessonNodes.findIndex((node) => node.status !== "completed");
      const targetNode =
        firstIncompleteIndex === -1
          ? lastNode
          : rowRefs.current[lessonNodes[firstIncompleteIndex].topicId] ?? firstNode;
      const targetCenter = targetNode.offsetTop + targetNode.offsetHeight / 2;
      const progress = Math.max(0, targetCenter - firstCenter);

      setSpineMetrics({
        top: firstCenter,
        bottom: Math.max(0, pathEl.clientHeight - lastCenter),
        progress,
      });
    };

    const frameId = window.requestAnimationFrame(measureSpine);
    window.addEventListener("resize", measureSpine);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measureSpine);
    };
  }, [lessonNodes]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!selectedLevel) return;
      if (mapRef.current && !mapRef.current.contains(event.target as Node)) {
        setSelectedLevel(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedLevel(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedLevel]);

  const statusLabel: Record<ProgressStatus, string> = {
    available: "Available",
    completed: "Completed",
    in_progress: "In progress",
    locked: "Locked",
  };

  const nodeStyles: Record<ProgressStatus, string> = {
    completed: "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-900/30 dark:text-emerald-300",
    in_progress:
      "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-300",
    available:
      "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-400/70 dark:bg-indigo-500/25 dark:text-indigo-100 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]",
    locked: "border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  const connectorStyles: Record<ProgressStatus, string> = {
    completed: "bg-emerald-400 dark:bg-emerald-500",
    in_progress: "bg-primary/50 dark:bg-primary/60",
    available: "bg-primary/40 dark:bg-primary/50",
    locked: "bg-gray-300 dark:bg-gray-700",
  };

  return (
    <div ref={mapRef} className="relative pb-16">
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        Follow the path. Select a level to preview it, then hit play.
      </p>

      <div ref={pathRef} className="relative space-y-8 sm:space-y-7 md:space-y-6">
        {lessonNodes.length > 0 && (
          <div
            className="pointer-events-none absolute left-1/2 z-0 w-px -translate-x-1/2"
            style={{ top: spineMetrics.top, bottom: spineMetrics.bottom }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div
              className="absolute inset-x-0 top-0 rounded-full bg-emerald-400 dark:bg-emerald-500 motion-safe:transition-[height] motion-safe:duration-300"
              style={{ height: `${spineMetrics.progress}px` }}
            />
          </div>
        )}

        {lessonNodes.map((node, index) => {
          const isLeft = index % 2 === 0;
          const isSelected = selectedLevel === node.topicId;
          const isActive = activeLevel === node.topicId;
          const isLocked = node.status === "locked";
          const failedAttempt = node.score !== null && node.score < 76 && node.status !== "completed";
          const accuracyTone =
            node.score === null
              ? "text-gray-500 dark:text-gray-400"
              : node.score >= 76
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400";
          const actionLabel = node.status === "completed" ? "Redo" : failedAttempt ? "Retry" : "Play";
          const actionHref = node.status === "completed" ? `${node.playHref}?redo=1` : node.playHref;

          return (
            <div
              key={node.topicId}
              ref={(el) => {
                rowRefs.current[node.topicId] = el;
              }}
              className={cn(
                "relative flex min-h-[10rem] items-center",
                isSelected ? "z-30" : isActive ? "z-20" : "z-0"
              )}
            >
              <div className="pointer-events-none absolute inset-0 z-0">
                <div
                  className={cn(
                    "absolute left-1/2 top-[calc(50%-0.5px)] h-px w-4",
                    connectorStyles[node.status],
                    isLeft ? "-translate-x-full" : "translate-x-0",
                    isActive && "motion-safe:animate-pulse"
                  )}
                />
              </div>
              <div
                className={cn(
                  "relative z-10 w-[calc(50%-0.75rem)] md:w-40 lg:w-44",
                  isLeft ? "mr-auto pr-4" : "ml-auto pl-4"
                )}
              >
                <button
                  type="button"
                  aria-expanded={isSelected}
                  aria-controls={`level-popover-${node.topicId}`}
                  aria-label={`Level ${node.pathIndex}: ${node.title}. ${statusLabel[node.status]}.`}
                  onClick={() => setSelectedLevel((prev) => (prev === node.topicId ? null : node.topicId))}
                  className={cn(
                    "group relative w-full rounded-xl border bg-white px-3.5 py-3 text-left shadow-sm transition-all duration-200",
                    "md:aspect-square md:px-4 md:py-4",
                    "md:flex md:flex-col md:justify-center",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    isSelected && "shadow-md ring-2 ring-primary/40 dark:ring-primary/50",
                    isActive && "motion-safe:animate-[pulse_3s_ease-in-out_infinite]",
                    "dark:bg-gray-900/80",
                    nodeStyles[node.status],
                    failedAttempt &&
                      "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/70 dark:bg-amber-900/30 dark:text-amber-300"
                  )}
                >
                  <span
                    className={cn(
                      "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
                      node.status === "locked" && "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800",
                      node.status === "available" &&
                        "border-indigo-300 bg-indigo-100 dark:border-indigo-400/70 dark:bg-indigo-500/35",
                      node.status === "in_progress" &&
                        "border-amber-300 bg-amber-200/70 dark:border-amber-500/60 dark:bg-amber-900/40",
                      node.status === "completed" &&
                        "border-emerald-300 bg-emerald-200/70 dark:border-emerald-500/60 dark:bg-emerald-900/40"
                    )}
                    aria-hidden="true"
                  >
                    {node.status === "completed" ? <Check className="h-5 w-5" /> : node.status === "locked" ? <Lock className="h-5 w-5" /> : node.pathIndex}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Level {node.pathIndex}</p>
                  <p className="mt-1 line-clamp-3 text-sm font-semibold">{node.title}</p>
                </button>

                {isSelected && (
                  <div
                    id={`level-popover-${node.topicId}`}
                    role="dialog"
                    aria-label={`Level ${node.pathIndex} details`}
                    className={cn(
                      "absolute z-20 mt-3 w-[min(calc(100vw-2rem),240px)] rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900",
                      "top-full md:top-1/2 md:mt-0 md:-translate-y-1/2",
                      isLeft ? "left-0 translate-x-0" : "right-0 left-auto translate-x-0",
                      isLeft ? "md:left-full md:ml-4 md:translate-x-0" : "md:right-full md:left-auto md:mr-4 md:translate-x-0"
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Level {node.pathIndex}</p>
                    <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{node.title}</h3>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Module {node.moduleNumber} - {node.moduleTitle}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{node.description}</p>
                    {node.score !== null && (
                      <p className={cn("mt-2 text-xs font-semibold", accuracyTone)}>Best accuracy: {node.score}%</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      {isLocked ? (
                        <Button size="sm" variant="secondary" disabled className="min-h-11 w-full">
                          Locked
                        </Button>
                      ) : (
                        <Button size="sm" className="min-h-11 w-full" asChild>
                          <Link href={actionHref} onClick={() => setSelectedLevel(null)}>
                            <Play className="mr-1.5 h-3.5 w-3.5" />
                            {actionLabel}
                          </Link>
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedLevel(null)}
                        className="min-h-11 rounded-md px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lessonNodes.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
          No levels are available yet.
        </div>
      )}
    </div>
  );
}
