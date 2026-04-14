"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useMemo } from "react";
import { verifyEmailCodeAction, resendVerificationCodeAction, type VerifyEmailCodeState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifySubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Verifying…" : "Verify code"}
    </Button>
  );
}

function ResendSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Resend code"}
    </Button>
  );
}

export function VerifyEmailCodeForm({ initialEmail }: { initialEmail?: string }) {
  const [verifyState, verifyAction] = useFormState(verifyEmailCodeAction, null as VerifyEmailCodeState);
  const [resendState, resendAction] = useFormState(resendVerificationCodeAction, null as VerifyEmailCodeState);

  const info = useMemo(() => {
    if (verifyState?.error) return verifyState.error;
    if (resendState?.error) return resendState.error;
    if (resendState?.ok) return "A new verification code was sent.";
    return null;
  }, [verifyState, resendState]);

  return (
    <div className="space-y-4">
      {info ? (
        <div className="rounded-lg border border-gray-300/70 bg-gray-100/70 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          {info}
        </div>
      ) : null}

      <form action={verifyAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="verifyEmail">Email</Label>
          <Input id="verifyEmail" name="email" type="email" autoComplete="email" defaultValue={initialEmail ?? ""} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="verificationCode">Verification code</Label>
          <Input
            id="verificationCode"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="6-digit code"
            required
          />
        </div>
        <VerifySubmit />
      </form>

      <form action={resendAction} className="space-y-2">
        <input type="hidden" name="email" value={initialEmail ?? ""} />
        <ResendSubmit />
      </form>
    </div>
  );
}
