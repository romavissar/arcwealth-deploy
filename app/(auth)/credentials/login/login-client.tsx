"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

function oauthErrorLabel(code: string | null): string | null {
  if (!code) return null;
  const labels: Record<string, string> = {
    google_config: "Google sign-in is not configured on this server.",
    state: "Sign-in session expired or invalid. Please try again.",
    missing: "Missing authorization code. Please try again.",
    token: "Could not complete sign-in with the provider. Please try again.",
    userinfo: "Could not load your profile from Google. Please try again.",
    no_email: "Your Google account did not share an email address.",
    link_denied: "Account linking was blocked for this email.",
    db: "Could not save your account. Please try again later.",
    session: "Signed in with the provider but session could not be created.",
  };
  return labels[code] ?? `Sign-in could not complete (${code}).`;
}

export function LoginMessages() {
  const sp = useSearchParams();
  const registered = sp.get("registered");
  const verified = sp.get("verified");
  const custom = sp.get("custom_session");
  const oauthError = sp.get("oauth_error");
  const oauthDetail = sp.get("msg");

  return (
    <>
      {oauthError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200">
          {oauthDetail ?? oauthErrorLabel(oauthError)}
        </div>
      )}
      {registered === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800 px-3 py-2 text-sm text-green-800 dark:text-green-200">
          Account created. Check your email for the verification link before signing in.
        </div>
      )}
      {verified === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800 px-3 py-2 text-sm text-green-800 dark:text-green-200">
          Email verified. You can sign in below.
        </div>
      )}
      {custom === "1" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          Password session is active. To use app routes with this session only, set{" "}
          <code className="text-xs">USE_LEGACY_CLERK=false</code> and <code className="text-xs">AUTH_SECRET</code> in{" "}
          <code className="text-xs">.env.local</code>. Otherwise continue with Clerk from{" "}
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>
          .
        </div>
      )}
    </>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, null as AuthFormState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200">
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <Submit />
    </form>
  );
}

export function LoginFooter() {
  return (
    <div className="flex flex-col gap-2 text-center text-sm text-gray-600 dark:text-gray-400">
      <Link href="/credentials/forgot-password" className="text-primary">
        Forgot password?
      </Link>
      <p>
        No account?{" "}
        <Link href="/credentials/register" className="text-primary font-medium">
          Register
        </Link>{" "}
        · Clerk:{" "}
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
