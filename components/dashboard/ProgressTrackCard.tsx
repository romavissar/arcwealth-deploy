import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ProgressTrackMetric {
  label: string;
  value: string;
}

interface ProgressTrackCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  ctaLabel: string;
  ctaHref: string;
  metrics: ProgressTrackMetric[];
  className?: string;
}

export function ProgressTrackCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  progressLabel,
  progressValue,
  ctaLabel,
  ctaHref,
  metrics,
  className,
}: ProgressTrackCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
        <span className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary/20" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>

      <div className="mt-4">
        <Progress value={progressValue} className="h-3" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">{progressLabel}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{metric.value}</p>
          </div>
        ))}
      </div>

      <Button asChild className="mt-5 w-full">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </section>
  );
}
