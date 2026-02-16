"use client";

const STAGES = [
  { key: "cue", label: "Cue", desc: "Trigger (time, place, emotion)" },
  { key: "craving", label: "Craving", desc: "Desire / motivation" },
  { key: "routine", label: "Routine", desc: "The behaviour" },
  { key: "reward", label: "Reward", desc: "Satisfaction → repeat" },
];

export function HabitLoopChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        The four-stage habit loop — key to building and breaking habits
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-1 sm:gap-2">
            <div className="rounded-lg border-2 border-primary/40 bg-primary/15 px-3 py-2 text-center min-w-[5rem] dark:border-primary/50 dark:bg-primary/25">
              <div className="font-bold text-gray-900 dark:text-gray-100">{stage.label}</div>
              <div className="text-xs text-gray-700 dark:text-gray-300">{stage.desc}</div>
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-lg font-bold text-gray-500 dark:text-gray-400" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center">
        <span className="text-xs text-gray-600 dark:text-gray-400">(loop back: Reward reinforces Cue)</span>
      </div>
    </div>
  );
}
