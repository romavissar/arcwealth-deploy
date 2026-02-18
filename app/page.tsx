import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="font-bold text-xl text-primary">
          ArcWealth
        </Link>
        <nav>
          {userId ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Open App
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Learn money. Build wealth.
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
          Financial literacy for teens, one lesson at a time. Master the basics of money, earning, and habits that last.
        </p>
        {!userId && (
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        )}
        {userId && (
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:opacity-90 transition-opacity"
          >
            Open App
          </Link>
        )}
      </main>
    </div>
  );
}
