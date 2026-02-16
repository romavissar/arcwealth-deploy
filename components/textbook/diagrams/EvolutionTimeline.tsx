"use client";

const stages = [
  { label: "Barter", period: "~9000 BCE", desc: "Direct trade of goods" },
  { label: "Commodity money", period: "~3000 BCE", desc: "Gold, silver, grain" },
  { label: "Coins", period: "~600 BCE", desc: "Standardised metal coins" },
  { label: "Paper money", period: "~1000 CE", desc: "Banknotes & receipts" },
  { label: "Digital payments", period: "2010s+", desc: "Cards, apps, crypto" },
];

export function EvolutionTimeline() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-nowrap justify-between gap-2 sm:gap-4">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex min-w-0 flex-1 flex-col items-center text-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {i + 1}
            </div>
            <p className="mt-2 font-semibold text-gray-900">{stage.label}</p>
            <p className="text-xs font-medium text-primary">{stage.period}</p>
            <p className="mt-1 text-xs text-gray-500">{stage.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        The evolution of money from barter to digital
      </p>
    </div>
  );
}
