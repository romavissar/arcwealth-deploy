"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage((j as { error?: string }).error ?? "Something went wrong.");
        return;
      }
      setStatus("done");
      setMessage("If an account exists for that email, you will receive a reset link shortly.");
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Forgot password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Enter your email and we&apos;ll send a reset link if an account exists.
        </p>
      </div>

      {status === "done" || status === "error" ? (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            status === "done"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {message}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link href="/sign-in" className="text-primary">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
