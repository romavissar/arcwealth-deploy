"use client";

const VALUES = [
  "Security",
  "Freedom",
  "Growth",
  "Family",
  "Adventure",
  "Achievement",
  "Community",
  "Health",
  "Creativity",
  "Generosity",
  "Status",
  "Pleasure",
];

export function CoreValuesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-3 text-center text-sm font-medium text-gray-800 dark:text-gray-200">
        12 common core values — identify your top 3–5 as your financial compass
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {VALUES.map((value) => (
          <div
            key={value}
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm font-semibold text-gray-900 dark:border-primary/40 dark:bg-primary/20 dark:text-gray-100"
          >
            {value}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
        Rate each 1–10, then force-rank your top 5
      </p>
    </div>
  );
}
