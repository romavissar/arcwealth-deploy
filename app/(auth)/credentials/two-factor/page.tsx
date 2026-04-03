"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  verifyTwoFactorLoginAction,
  type TwofaFormState,
} from "@/app/actions/auth-2fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Verifying…" : "Continue"}
    </Button>
  );
}

export default function TwoFactorChallengePage() {
  const [state, formAction] = useFormState(verifyTwoFactorLoginAction, null as TwofaFormState);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Two-factor authentication</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Enter the 6-digit code from your authenticator app, or a one-time recovery code.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200">
            {state.error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="code">Authenticator or recovery code</Label>
          <Input
            id="code"
            name="code"
            autoComplete="one-time-code"
            inputMode="text"
            placeholder="123456 or xxxx-xxxx-xx"
            required
            autoFocus
          />
        </div>
        <Submit />
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        <Link href="/credentials/login" className="text-primary">
          Cancel and return to sign in
        </Link>
      </p>
    </div>
  );
}
