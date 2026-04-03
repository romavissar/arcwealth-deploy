import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcWealth — Learn Money",
  description: "Financial literacy for teens, one lesson at a time.",
};

const useLegacyClerk = process.env.USE_LEGACY_CLERK !== "false";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );

  if (useLegacyClerk) {
    return <ClerkProvider>{shell}</ClerkProvider>;
  }

  return shell;
}
