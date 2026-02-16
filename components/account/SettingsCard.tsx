import { cn } from "@/lib/utils";

export function SettingsCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
}
