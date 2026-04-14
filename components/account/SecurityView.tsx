"use client";

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsCard } from "./SettingsCard";
import { TwoFactorSettings } from "./TwoFactorSettings";
import { signOutFromAppAction } from "@/app/actions/auth";

type SessionRow = { id: string; createdAt: string; isCurrent: boolean };

export function SecurityView({
  isStudent = false,
  twoFactorState = null,
}: {
  isStudent?: boolean;
  twoFactorState?: { enabled: boolean; recoveryRemaining: number } | null;
}) {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/sessions")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load sessions");
        return r.json();
      })
      .then((d: { sessions?: SessionRow[] }) => setSessions(d.sessions ?? []))
      .catch((e) => setSessionsError(e instanceof Error ? e.message : "Error"));
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation don't match." });
      return;
    }
    setPasswordUpdating(true);
    try {
      const res = await fetch("/api/account/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText || "Failed to update password");
      setPasswordMessage({ type: "success", text: "Password updated. Other devices were signed out." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      const r2 = await fetch("/api/account/sessions");
      if (r2.ok) {
        const d2 = await r2.json();
        setSessions(d2.sessions ?? []);
      }
    } catch (e) {
      setPasswordMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to update password",
      });
    } finally {
      setPasswordUpdating(false);
    }
  }

  async function handleRevoke(sessionId: string) {
    setSessionsError(null);
    setRevokingId(sessionId);
    try {
      const res = await fetch("/api/account/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText || "Failed to revoke session");
      const r2 = await fetch("/api/account/sessions");
      if (r2.ok) {
        const d2 = await r2.json();
        setSessions(d2.sessions ?? []);
      }
    } catch (e) {
      setSessionsError(e instanceof Error ? e.message : "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleDeleteAccount() {
    setDeleteMessage(null);
    if (
      !confirm(
        "Are you sure? This cannot be undone. You will be signed out and your account will be permanently deleted."
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || (await res.text()));
      }
      window.location.href = "/";
    } catch (e) {
      setDeleteMessage(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SettingsCard className="space-y-8">
      {twoFactorState ? (
        <TwoFactorSettings
          initialEnabled={twoFactorState.enabled}
          recoveryRemaining={twoFactorState.recoveryRemaining}
        />
      ) : (
        <p className="-mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Two-factor settings load after the page reads your account.
        </p>
      )}

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Security</p>
        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Password</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Keep your account secure by using a unique password.
        </p>
        <div className="mb-3 border-b border-gray-200 pb-3 dark:border-gray-700" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="font-mono text-sm tracking-wider text-gray-600 dark:text-gray-400">••••••••••</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowPasswordForm((v) => !v);
              setPasswordMessage(null);
            }}
          >
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
            {showPasswordForm ? "Hide form" : "Change password"}
          </Button>
        </div>
        {showPasswordForm && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              You’ll be signed out of all other devices after updating.
            </p>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="current-password-c" className="text-gray-900 dark:text-gray-100">
                  Current password
                </Label>
                <Input
                  id="current-password-c"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  disabled={passwordUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password-c" className="text-gray-900 dark:text-gray-100">
                  New password
                </Label>
                <Input
                  id="new-password-c"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  disabled={passwordUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password-c" className="text-gray-900 dark:text-gray-100">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-password-c"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={passwordUpdating}
                />
              </div>
              {passwordMessage && (
                <p
                  role="status"
                  className={
                    passwordMessage.type === "error"
                      ? "text-sm text-red-600 dark:text-red-400"
                      : "text-sm text-green-600 dark:text-green-400"
                  }
                >
                  {passwordMessage.text}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={passwordUpdating}>
                  {passwordUpdating ? "Updating..." : "Update password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordMessage(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={passwordUpdating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sessions</p>
        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Active devices</h2>
        <p className="mb-3 mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage where you’re signed in. Revoke sessions you don’t recognize.
        </p>
        {sessionsError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{sessionsError}</p>
        ) : sessions === null ? (
          <p className="text-sm text-gray-500">Loading sessions...</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {session.isCurrent ? "This device" : new Date(session.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono text-xs">{session.id}</p>
                </div>
                {session.isCurrent ? (
                  <form action={signOutFromAppAction}>
                    <Button type="submit" variant="outline" size="sm">
                      Sign out
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(session.id)}
                    disabled={revokingId === session.id}
                  >
                    {revokingId === session.id ? "Revoking…" : "Revoke"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Danger zone</p>
        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Delete account</h2>
        {isStudent ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Account deletion is not available while you are assigned to a teacher. Contact your teacher or school admin
            if you need to leave the class.
          </p>
        ) : (
          <>
            <p className="mb-3 mt-2 text-sm text-gray-600 dark:text-gray-300">
              Permanently delete your account and all data. This cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete account"}
            </Button>
            {deleteMessage && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{deleteMessage}</p>}
          </>
        )}
      </section>
    </SettingsCard>
  );
}
