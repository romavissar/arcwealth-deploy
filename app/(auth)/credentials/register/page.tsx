"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : label}
    </Button>
  );
}

export default function CredentialsRegisterPage() {
  const [state, formAction] = useFormState(registerAction, null as AuthFormState);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Email & password registration (custom auth). You can still use Clerk on{" "}
          <Link href="/sign-up" className="text-primary underline">
            Sign up
          </Link>{" "}
          until migration completes.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200">
            {state.error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" required autoComplete="given-name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" required autoComplete="family-name" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="birthDate">Birth date</Label>
          <Input id="birthDate" name="birthDate" type="date" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          <p className="text-xs text-gray-500 dark:text-gray-400">At least 8 characters.</p>
        </div>
        <Submit label="Register" />
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/credentials/login" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
