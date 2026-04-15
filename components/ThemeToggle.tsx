"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonSizeClass = compact ? "h-9 w-9" : "h-11 w-11";
  const iconSizeClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  const colorClass = "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100";

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn(buttonSizeClass, colorClass, className)} aria-label="Toggle theme">
        <Sun className={iconSizeClass} />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(buttonSizeClass, colorClass, className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className={iconSizeClass} /> : <Moon className={iconSizeClass} />}
    </Button>
  );
}
