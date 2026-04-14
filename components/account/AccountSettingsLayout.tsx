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
    <div className="account-settings-page mx-auto max-w-5xl space-y-6 pb-4">
      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Settings</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Manage your account
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Update your profile, secure your sign-in, and tune your experience.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-right dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">{sectionCategory}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sectionLabel}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Account
              </h2>
              <nav className="flex flex-col gap-1">
                {accountNav.map(({ href, label, icon: Icon }) => {
                  const active =
                    (label === "Profile" && isProfile) || (label === "Security" && isSecurity);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        active
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Preferences
              </h2>
              <nav className="flex flex-col gap-1">
                {preferencesNav.map(({ href, label, icon: Icon }) => {
                  const active = label === "Appearance" && isAppearance;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        active
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <nav className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:hidden">
            {[...accountNav, ...preferencesNav].map(({ href, label, icon: Icon }) => {
              const active =
                (label === "Profile" && isProfile) ||
                (label === "Security" && isSecurity) ||
                (label === "Appearance" && isAppearance);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    active
                      ? "border-primary/30 bg-primary/10 text-primary dark:bg-primary/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Settings className="h-4 w-4 text-primary" aria-hidden />
            {isAppearance ? <Palette className="h-4 w-4" aria-hidden /> : <User className="h-4 w-4" aria-hidden />}
            <span>
              {sectionCategory} / {sectionLabel}
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
