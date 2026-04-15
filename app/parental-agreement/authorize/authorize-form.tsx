"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { submitParentalAuthorization, type ParentAuthorizeState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full min-h-11" disabled={pending}>
      {pending ? "Submitting authorization..." : "Authorize child account"}
    </Button>
  );
}

export function AuthorizeForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(submitParentalAuthorization, null as ParentAuthorizeState);
  const [confirmed, setConfirmed] = useState(false);

  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/70 dark:bg-green-950/40 dark:text-green-200">
          {state.success}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You can close this page now. If your child still cannot sign in, ask them to verify their email first.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
          {state.error}
        </div>
      ) : null}

      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <Label htmlFor="parentFullName">
          Parent/legal guardian full name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="parentFullName"
          name="parentFullName"
          required
          autoComplete="name"
          placeholder="Enter your full legal name"
          className="min-h-11"
        />
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
        <input
          id="confirmed"
          name="confirmed"
          type="checkbox"
          required
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span>
          I confirm I am the parent/legal guardian and I authorize ArcWealth to create and maintain this child&apos;s account
          under the terms in the{" "}
          <Link href="/parental-agreement" target="_blank" className="text-primary underline underline-offset-2">
            Parental Agreement
          </Link>
          .
        </span>
      </label>

      <SubmitButton />
    </form>
  );
}
