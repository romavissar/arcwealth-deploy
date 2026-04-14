"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./SettingsCard";

const OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export function AppearanceView() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (mounted ? theme : "system") ?? "system";

  return (
    <SettingsCard className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Preferences</p>
        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Theme</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Choose how ArcWealth looks. System follows your device preference.
        </p>
        {!mounted ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {OPTIONS.map(({ label }) => (
              <div
                key={label}
                className="h-12 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  current === value
                    ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        )}
        {mounted && current === "system" && (
          <p className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Currently: {resolvedTheme === "dark" ? "Dark" : "Light"} (from system)
          </p>
        )}
      </section>
    </SettingsCard>
  );
}
