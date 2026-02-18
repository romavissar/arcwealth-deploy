"use client";

const STEPS = [
  "Receive payslip (within 24h)",
  "Check gross pay — matches contract? Overtime/bonuses correct?",
  "Verify hours (waged) — match your records?",
  "Check all deductions — tax code, pension %, any unexpected?",
  "Verify net pay — matches amount in bank?",
  "Check year-to-date totals — accumulating correctly?",
  "File and save — e.g. Payslip_2026_January.pdf (keep 6+ years)",
];

export function PayslipCheckingRoutineChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        7-step monthly payslip check — about 5 minutes, every month
      </p>
      <div className="space-y-2">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 dark:border-primary/40 dark:bg-primary/20">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
