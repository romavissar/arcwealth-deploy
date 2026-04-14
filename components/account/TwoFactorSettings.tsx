"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  confirmTotpEnrollmentAction,
  disableTotpAction,
  startTotpEnrollmentAction,
  type TwofaFormState,
} from "@/app/actions/auth-2fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
function ConfirmSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Confirming…" : "Confirm and enable"}
    </Button>
  );
}

function DisableSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Disabling…" : "Turn off 2FA"}
    </Button>
  );
}

export function TwoFactorSettings({
  initialEnabled,
  recoveryRemaining,
}: {
  initialEnabled: boolean;
  recoveryRemaining: number;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [enrollState, confirmAction] = useFormState(confirmTotpEnrollmentAction, null as TwofaFormState);
  const [disableState, disableAction] = useFormState(disableTotpAction, null as TwofaFormState);

  async function handleStart() {
    setStarting(true);
    setQrDataUrl(null);
    setStartError(null);
    try {
      const r = await startTotpEnrollmentAction();
      if (r.ok) setQrDataUrl(r.qrDataUrl);
      else setStartError(r.error);
    } finally {
      setStarting(false);
    }
  }

  if (enrollState?.ok && enrollState.recoveryCodes?.length) {
    return (
      <section className="space-y-4 border-b border-gray-200 pb-8 dark:border-gray-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Security</p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Save your recovery codes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Each code works once. Store them somewhere safe — we won’t show them again.
        </p>
        <ul className="space-y-1 rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm dark:border-gray-700 dark:bg-gray-800">
          {enrollState.recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <Button
          type="button"
          onClick={() => {
            setEnabled(true);
            setQrDataUrl(null);
            window.location.reload();
          }}
        >
          Done
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6 border-b border-gray-200 pb-8 dark:border-gray-700">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Security</p>
        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Two-factor authentication</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Use an authenticator app (Google Authenticator, 1Password, etc.). SMS-based 2FA is not supported.
        </p>

        {enabled ? (
          <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              2FA is <span className="font-medium text-green-700 dark:text-green-400">on</span>.
              {recoveryRemaining > 0 ? (
                <> You have {recoveryRemaining} unused recovery code{recoveryRemaining === 1 ? "" : "s"} left.</>
              ) : (
                <> No unused recovery codes — consider disabling and re-enabling to generate new codes if you lose your device.</>
              )}
            </p>
            <form action={disableAction} className="space-y-3 max-w-sm">
              {disableState?.error && (
                <p className="text-sm text-red-600 dark:text-red-400">{disableState.error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="disable-2fa-password">Password to confirm</Label>
                <Input
                  id="disable-2fa-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <DisableSubmit />
            </form>
          </div>
        ) : (
          <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Protect your account with a time-based code from an app on your phone.
            </p>
            <Button type="button" variant="outline" onClick={handleStart} disabled={starting}>
              {starting ? "Preparing..." : "Set up authenticator"}
            </Button>
            {startError && <p className="text-sm text-red-600 dark:text-red-400">{startError}</p>}

            {qrDataUrl && (
              <form action={confirmAction} className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Scan the QR code, then enter the 6-digit code to confirm.
                </p>
                <div className="mx-auto flex w-fit justify-center rounded-xl border border-gray-200 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL from server action */}
                  <img src={qrDataUrl} alt="Authenticator QR code" width={220} height={220} />
                </div>
                {enrollState?.error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{enrollState.error}</p>
                )}
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="totp-code">Verification code</Label>
                  <Input id="totp-code" name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="000000" required />
                </div>
                <ConfirmSubmit />
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
