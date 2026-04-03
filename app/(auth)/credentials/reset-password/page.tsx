"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetForm() {
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("Missing token. Open the link from your email.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage((j as { error?: string }).error ?? "Could not reset password.");
        return;
      }
      setStatus("done");
      setMessage("Password updated. You can sign in with your new password.");
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  if (!token && status === "idle") {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        No reset token. Use the link from your email or{" "}
        <Link href="/credentials/forgot-password" className="underline">
          request a new one
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {(status === "done" || status === "error") && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            status === "done"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {message}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400">At least 8 characters.</p>
      </div>
      <Button type="submit" className="w-full" disabled={status === "loading" || status === "done"}>
        {status === "loading" ? "Saving…" : "Update password"}
      </Button>
      {status === "done" && (
        <p className="text-center text-sm">
          <Link href="/sign-in" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reset password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose a new password for your account.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
