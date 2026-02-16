"use client";

const STEPS = [
  { num: 1, title: "Identify your “Why”", detail: "Connect goal to core values (5-Whys)" },
  { num: 2, title: "Make it SMART", detail: "Specific, Measurable, Achievable, Relevant, Time-bound" },
  { num: 3, title: "Break into milestones", detail: "30–60 day chunks" },
  { num: 4, title: "Create a tracking system", detail: "Weekly reviewable progress" },
  { num: 5, title: "Build accountability", detail: "Partner, stake, or public commitment" },
  { num: 6, title: "Review and adjust", detail: "Monthly check — continue, adjust, or adapt" },
];

export function GoalProcessChart() {
  return (
    <div className="my-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="mb-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        The 6-step goal-setting process — follow for every major financial goal
      </p>
      <div className="space-y-2">
        {STEPS.map((step) => (
          <div key={step.num} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {step.num}
            </span>
            <div className="flex-1 border-l-2 border-primary/30 dark:border-primary/50 pl-3 pb-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
