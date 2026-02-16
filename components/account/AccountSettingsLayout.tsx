"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User, Shield, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const accountNav = [
  { href: "/settings", label: "Profile", icon: User },
  { href: "/settings/security", label: "Security", icon: Shield },
] as const;

const preferencesNav = [
  { href: "/settings/appearance", label: "Appearance", icon: Palette },
] as const;

export function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProfile = pathname === "/settings" || pathname === "/settings/profile";
  const isSecurity = pathname.startsWith("/settings/security");
  const isAppearance = pathname.startsWith("/settings/appearance");
  const sectionLabel = isAppearance ? "Appearance" : isSecurity ? "Security" : "Profile";
  const sectionCategory = isAppearance ? "Preferences" : "Account";

  return (
    <div className="account-settings-page flex w-full min-w-0 gap-8">
      {/* Left: Settings sidebar (RevisionDojo-style) */}
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-20 space-y-6">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Account
            </h2>
            <nav className="flex flex-col gap-0.5">
              {accountNav.map(({ href, label, icon: Icon }) => {
                const active =
                  (label === "Profile" && isProfile) || (label === "Security" && isSecurity);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Preferences
            </h2>
            <nav className="flex flex-col gap-0.5">
              {preferencesNav.map(({ href, label, icon: Icon }) => {
                const active = label === "Appearance" && isAppearance;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Right: Main content */}
      <div className="min-w-0 flex-1">
        {/* Mobile nav (RevisionDojo-style: show section switcher on small screens) */}
        <nav className="mb-4 flex flex-wrap gap-2 md:hidden">
          {accountNav.map(({ href, label, icon: Icon }) => {
            const active =
              (label === "Profile" && isProfile) || (label === "Security" && isSecurity);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          {preferencesNav.map(({ href, label, icon: Icon }) => {
            const active = label === "Appearance" && isAppearance;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Settings header (gear + title) */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              {isAppearance ? <Palette className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {sectionCategory} · {sectionLabel}
            </p>
          </div>
        </div>

        {/* Content: Clerk UserProfile root is the only card (styled via appearance) */}
        {children}
      </div>
    </div>
  );
}
