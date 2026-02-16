"use client";

const TACTICS = [
  { name: "Charm pricing", example: "€29.99 vs €30", short: "Left-digit effect" },
  { name: "Price anchoring", example: "Was €199 / Now €99", short: "Fake reference" },
  { name: "Decoy effect", example: "S €3 / M €4.80 / L €5", short: "Bad option shifts choice" },
  { name: "Bundle pricing", example: "Buy 3, get 20% off", short: "Spend more to 'save'" },
  { name: "Prestige pricing", example: "€8,500 not €8,499.99", short: "Round = luxury" },
  { name: "Time pressure", example: "Sale ends in 4h 32m", short: "FOMO" },
  { name: "Drip pricing", example: "€50 + €5 fees + €3", short: "Hidden fees at checkout" },
  { name: "Price framing", example: "€2.50/day vs €912/yr", short: "Small units hide total" },
];

export function PricingTacticsChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        {TACTICS.map((t, i) => (
          <div
            key={t.name}
            className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
          >
            <span className="text-xs font-semibold text-primary">{i + 1}. {t.name}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.example}</span>
            <span className="text-xs text-gray-700 dark:text-gray-200">{t.short}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
        Eight common tactics — recognising them is the first step to resisting
      </p>
    </div>
  );
}
