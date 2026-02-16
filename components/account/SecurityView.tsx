"use client";

import { useUser, useSessionList, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsCard } from "./SettingsCard";

export function SecurityView() {
  const { user } = useUser();
  const { sessions, isLoaded } = useSessionList();
  const { signOut } = useClerk();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  if (!user) return null;

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
      setPasswordMessage({ type: "success", text: "Password updated. You've been signed out of other devices." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      if (sessions?.length && sessions.length > 1) window.location.reload();
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
    setRevokingId(sessionId);
    try {
      const res = await fetch("/api/account/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText || "Failed to revoke session");
      if (sessions?.length === 1) await signOut({ redirectUrl: "/" });
      else window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure? This cannot be undone. You will be signed out and your account will be permanently deleted.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      await signOut({ redirectUrl: "/" });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SettingsCard className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Password</h2>
        <div className="border-b border-gray-200 dark:border-gray-600 pb-3 mb-3" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wider">
            ••••••••••
          </p>
          <button
            type="button"
            onClick={() => {
              setShowPasswordForm((v) => !v);
              setPasswordMessage(null);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            <Pencil className="h-4 w-4 shrink-0" aria-hidden />
            Change password
          </button>
        </div>
        {showPasswordForm && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              You’ll be signed out of all other devices after updating.
            </p>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-gray-900 dark:text-gray-100">
                  Current password
                </Label>
                <Input
                  id="current-password"
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
                <Label htmlFor="new-password" className="text-gray-900 dark:text-gray-100">
                  New password
                </Label>
                <Input
                  id="new-password"
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
                <Label htmlFor="confirm-password" className="text-gray-900 dark:text-gray-100">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-password"
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
                  {passwordUpdating ? "Updating…" : "Update password"}
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Active devices</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Manage where you’re signed in. Sign out or revoke sessions you don’t recognize.
        </p>
        {!isLoaded ? (
          <p className="text-sm text-gray-500">Loading sessions…</p>
        ) : (
          <ul className="space-y-2">
            {sessions?.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString() : "Current session"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.id}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(session.id)}
                  disabled={revokingId === session.id}
                >
                  {revokingId === session.id ? "Revoking…" : "Revoke"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Delete account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete account"}
        </Button>
      </section>
    </SettingsCard>
  );
}
