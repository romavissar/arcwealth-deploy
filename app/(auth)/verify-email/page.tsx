import type { ReactNode } from "react";
import Link from "next/link";

export default function VerifyEmailResultPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const success = searchParams.success === "1" || searchParams.success === "true";
  const err = typeof searchParams.error === "string" ? searchParams.error : undefined;

  let title = "Email verification";
  let body: ReactNode = null;

  if (success) {
    title = "Email verified";
    body = (
      <p className="text-gray-600 dark:text-gray-300">
        Your email is confirmed. You can{" "}
        <Link href="/credentials/login" className="text-primary font-medium">
          sign in with your password
        </Link>
        .
      </p>
    );
  } else if (err === "expired") {
    body = <p className="text-gray-600 dark:text-gray-300">This link has expired. Register again or request a new verification email (coming in a later update).</p>;
  } else if (err === "invalid" || err === "missing") {
    body = <p className="text-gray-600 dark:text-gray-300">This verification link is invalid or was already used.</p>;
  } else {
    body = <p className="text-gray-600 dark:text-gray-300">Check your email for a verification link after registering.</p>;
  }

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      {body}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <Link href="/credentials/login" className="text-primary">
          Sign in
        </Link>{" "}
        ·{" "}
        <Link href="/sign-in" className="underline">
          Clerk sign in
        </Link>
      </p>
    </div>
  );
}
