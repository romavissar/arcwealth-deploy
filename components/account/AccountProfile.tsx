"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function AccountProfile() {
  const { resolvedTheme } = useTheme();

  return (
    <UserProfile
      routing="path"
      path="/settings"
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          borderRadius: "0.75rem",
          colorBackground: "transparent",
          colorInputBackground: "transparent",
        },
        elements: {
          /* Single card: root is the only container (replaces layout wrapper) */
          rootBox: "w-full max-w-full font-sans rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800",
          card: "w-full max-w-full shadow-none border-0 rounded-none bg-transparent p-0 font-sans",
          cardBox: "w-full max-w-full bg-transparent p-0",
          navbar: "hidden",
          navbarMobileMenuRow: "hidden",
          pageScrollBox: "w-full max-w-full p-0 bg-transparent font-sans",
          page: "shadow-none border-0 bg-transparent",
        },
      }}
    />
  );
}
