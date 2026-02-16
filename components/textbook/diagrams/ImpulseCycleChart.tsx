"use client";

const STAGES = [
  { num: 1, label: "Trigger", short: "Ad, notification, boredom, stress" },
  { num: 2, label: "Desire", short: "“I want this now”" },
  { num: 3, label: "Purchase", short: "Bought with minimal research" },
  { num: 4, label: "Brief High", short: "Short-lived dopamine reward" },
  { num: 5, label: "Regret", short: "Buyer’s remorse" },
  { num: 6, label: "Rationalise", short: "“It was on sale”, “I deserved it”" },
];

export function ImpulseCycleChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap justify-center gap-3">
        {STAGES.map((stage, i) => (
          <div key={stage.num} className="flex items-center gap-2">
            <div className="flex min-w-[140px] flex-col rounded-lg border-2 border-primary/30 bg-primary/5 px-3 py-2 text-center">
              <span className="text-xs font-semibold text-primary">Step {stage.num}</span>
              <span className="font-semibold text-gray-900">{stage.label}</span>
              <span className="text-xs text-gray-600">{stage.short}</span>
            </div>
            {i < STAGES.length - 1 && (
              <span className="hidden text-gray-300 sm:inline" aria-hidden>
                →
              </span>
            )}
            {i === STAGES.length - 1 && (
              <span className="hidden text-gray-400 sm:inline" aria-hidden>
                ↻
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        Each completed loop makes the next one more automatic
      </p>
    </div>
  );
}
