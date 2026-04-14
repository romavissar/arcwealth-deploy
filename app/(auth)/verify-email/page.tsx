import type { ReactNode } from "react";
import Link from "next/link";
import { VerifyEmailCodeForm } from "./verify-email-form";

export default function VerifyEmailResultPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const success = searchParams.success === "1" || searchParams.success === "true";
  const err = typeof searchParams.error === "string" ? searchParams.error : undefined;
  const email = typeof searchParams.email === "string" ? searchParams.email : "";
  const sent = searchParams.sent === "1";

  let title = "Email verification";
  let body: ReactNode = null;

  if (success) {
    title = "Email verified";
    body = (
      <p className="text-gray-600 dark:text-gray-300">
        Your email is confirmed. You can{" "}
        <Link href="/sign-in" className="text-primary font-medium">
          sign in with your password
        </Link>
        .
      </p>
    );
  } else if (err === "expired") {
    body = <p className="text-gray-600 dark:text-gray-300">This link has expired. Enter your code below or resend a fresh code.</p>;
  } else if (err === "invalid" || err === "missing") {
    body = <p className="text-gray-600 dark:text-gray-300">This verification link is invalid or was already used. Enter your verification code below.</p>;
  } else {
    body = (
      <p className="text-gray-600 dark:text-gray-300">
        {sent
          ? "We sent a 6-digit verification code to your email. Enter it below to complete signup."
          : "Enter your verification code to confirm your email."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      {body}
      {!success ? <VerifyEmailCodeForm initialEmail={email} /> : null}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <Link href="/sign-in" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
