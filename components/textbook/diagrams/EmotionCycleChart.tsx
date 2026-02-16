"use client";

const STAGES = [
  { num: 1, label: "Negative emotion", short: "Stress, boredom, sadness, anxiety" },
  { num: 2, label: "Seek relief", short: "Brain recalls shopping worked before" },
  { num: 3, label: "Emotional purchase", short: "Rapid, impulsive buy" },
  { num: 4, label: "Temporary relief", short: "Dopamine hit; 10 min–few hours" },
  { num: 5, label: "Guilt & regret", short: "Buyer's remorse; financial worry" },
  { num: 6, label: "Worsened emotion", short: "Original + guilt → loop continues" },
];

export function EmotionCycleChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap justify-center gap-2">
        {STAGES.map((stage, i) => (
          <div key={stage.num} className="flex items-center gap-1.5">
            <div className="flex min-w-[120px] flex-col rounded-lg border-2 border-rose-200 bg-rose-50/80 px-2 py-2 text-center sm:min-w-[140px]">
              <span className="text-xs font-semibold text-rose-700">Stage {stage.num}</span>
              <span className="font-semibold text-gray-900">{stage.label}</span>
              <span className="text-xs text-gray-600">{stage.short}</span>
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-gray-400" aria-hidden>→</span>
            )}
            {i === STAGES.length - 1 && (
              <span className="text-rose-400" aria-hidden>↻</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        Each completed loop strengthens the pattern — interrupt before Stage 3
      </p>
    </div>
  );
}
