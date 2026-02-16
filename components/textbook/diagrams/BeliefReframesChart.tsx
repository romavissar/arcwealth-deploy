"use client";

const PAIRS = [
  { limiting: "Money doesn't grow on trees", reframe: "Money is a renewable resource created through value" },
  { limiting: "Rich people are greedy/corrupt", reframe: "Wealth can be earned ethically and used for good" },
  { limiting: "I'm just not good with money", reframe: "Financial skills can be learned at any age" },
  { limiting: "Money is the root of all evil", reframe: "Money is neutral — it amplifies existing values" },
  { limiting: "I don't deserve to be wealthy", reframe: "Everyone deserves financial security and opportunity" },
];

export function BeliefReframesChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        {PAIRS.map(({ limiting, reframe }, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-sm font-medium text-rose-800 sm:min-w-[200px]">&ldquo;{limiting}&rdquo;</p>
            <span className="hidden text-gray-300 sm:inline" aria-hidden>→</span>
            <p className="text-sm text-emerald-800 sm:flex-1">&ldquo;{reframe}&rdquo;</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-gray-500">
        Reframes open possibility; the question is whether a belief serves you
      </p>
    </div>
  );
}
