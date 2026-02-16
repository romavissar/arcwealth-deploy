"use client";

export function FourScriptsChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mx-auto max-w-md">
        <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
          <span>Restrictive</span>
          <span>Behavioural tendency</span>
          <span>Expressive</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50/80 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Stress</p>
            <p className="mt-1 font-semibold text-gray-900">Money Avoidance</p>
            <p className="mt-0.5 text-xs text-gray-600">Money is bad; I don&apos;t deserve wealth</p>
          </div>
          <div className="rounded-lg border-2 border-rose-200 bg-rose-50/80 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">Stress</p>
            <p className="mt-1 font-semibold text-gray-900">Money Worship</p>
            <p className="mt-0.5 text-xs text-gray-600">More money = happiness; never enough</p>
          </div>
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/80 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Security</p>
            <p className="mt-1 font-semibold text-gray-900">Money Vigilance</p>
            <p className="mt-0.5 text-xs text-gray-600">Be careful; save; prepare for disaster</p>
          </div>
          <div className="rounded-lg border-2 border-violet-200 bg-violet-50/80 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Security</p>
            <p className="mt-1 font-semibold text-gray-900">Money Status</p>
            <p className="mt-0.5 text-xs text-gray-600">Net worth = self-worth; spend to impress</p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">
          Emotional relationship: stress ↔ security (vertical)
        </p>
      </div>
      <p className="mt-3 text-center text-sm text-gray-500">
        Klontz & Britt framework — most people have one dominant script
      </p>
    </div>
  );
}
