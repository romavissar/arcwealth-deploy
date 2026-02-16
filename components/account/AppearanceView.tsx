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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Theme</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose how ArcWealth looks. System follows your device preference.
        </p>
        {!mounted ? (
          <div className="flex flex-col sm:flex-row gap-2">
            {OPTIONS.map(({ label }) => (
              <div
                key={label}
                className="h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                  current === value
                    ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        )}
        {mounted && current === "system" && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Currently: {resolvedTheme === "dark" ? "Dark" : "Light"} (from system)
          </p>
        )}
      </section>
    </SettingsCard>
  );
}
