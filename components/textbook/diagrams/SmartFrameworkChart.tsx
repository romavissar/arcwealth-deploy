"use client";

const CRITERIA = [
  { letter: "S", name: "Specific", desc: "Clear, precise target — no ambiguity" },
  { letter: "M", name: "Measurable", desc: "Track progress with numbers" },
  { letter: "A", name: "Achievable", desc: "Challenging but realistic" },
  { letter: "R", name: "Relevant", desc: "Aligns with your values" },
  { letter: "T", name: "Time-bound", desc: "Clear deadline" },
];

export function SmartFrameworkChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        The five criteria that make goals actionable and achievable
      </p>
      <div className="space-y-3">
        {CRITERIA.map((c) => (
          <div
            key={c.letter}
            className="flex items-center gap-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 dark:border-primary/40 dark:bg-primary/20"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {c.letter}
            </span>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
