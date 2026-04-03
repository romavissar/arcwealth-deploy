import { Suspense } from "react";
import Link from "next/link";
import { OAuthProviderButtons } from "@/app/(auth)/credentials/oauth-buttons";
import { LoginFooter, LoginForm, LoginMessages } from "@/app/(auth)/credentials/login/login-client";

export default function SignInPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams.redirect_url;
  const redirectTo = Array.isArray(raw) ? raw[0] : raw;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sign in</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Email, password, or Google. New here?{" "}
          <Link href="/sign-up" className="text-primary font-medium underline">
            Create an account
          </Link>
          .
        </p>
      </div>

      <OAuthProviderButtons />

      <Suspense fallback={null}>
        <LoginMessages />
      </Suspense>

      <LoginForm redirectTo={redirectTo ?? undefined} />

      <LoginFooter variant="public" />
    </div>
  );
}
