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
  const oauthError = sp.get("oauth_error");
  const oauthDetail = sp.get("msg");
  const twofaDisabled = sp.get("twofa_disabled");

  return (
    <>
      {twofaDisabled === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800 px-3 py-2 text-sm text-green-800 dark:text-green-200">
          Two-factor authentication was turned off. Sign in with your email and password.
        </div>
      )}
      {oauthError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200">
          {oauthDetail ?? oauthErrorLabel(oauthError)}
        </div>
      )}
      {registered === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800 px-3 py-2 text-sm text-green-800 dark:text-green-200">
          Account created. Check your email for the verification code before signing in.
        </div>
      )}
      {verified === "1" && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800 px-3 py-2 text-sm text-green-800 dark:text-green-200">
          Email verified. You can sign in below.
        </div>
      )}
    </>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useFormState(loginAction, null as AuthFormState);

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo ? <input type="hidden" name="redirect_url" value={redirectTo} /> : null}
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

export function LoginFooter({ variant = "credentials" }: { variant?: "credentials" | "public" }) {
  if (variant === "public") {
    return (
      <div className="flex flex-col gap-2 text-center text-sm text-gray-600 dark:text-gray-400">
        <Link href="/credentials/forgot-password" className="text-primary">
          Forgot password?
        </Link>
        <p>
          No account?{" "}
          <Link href="/sign-up" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Alternate:{" "}
          <Link href="/credentials/login" className="underline">
            /credentials/login
          </Link>
        </p>
      </div>
    );
  }

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
        ·{" "}
        <Link href="/sign-in" className="font-medium text-primary underline">
          Main sign in
        </Link>
      </p>
    </div>
  );
}
