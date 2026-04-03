import { Resend } from "resend";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function getFrom(): string {
  return (process.env.RESEND_FROM ?? "ArcWealth <onboarding@resend.dev>").trim();
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Send email verification link. In dev without RESEND_API_KEY, logs the URL.
 */
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<{ error?: string }> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.log("[auth-email] Verification link (no RESEND_API_KEY):", verifyUrl);
    }
    return { error: "RESEND_API_KEY is not set" };
  }
  const result = await resend.emails.send({
    from: getFrom(),
    to: [to],
    subject: "Verify your ArcWealth email",
    html: `
      <p>Hi ${escapeHtml(to.split("@")[0])},</p>
      <p>Click the link below to verify your email and finish setting up your account.</p>
      <p><a href="${escapeHtml(verifyUrl)}">Verify email</a></p>
      <p>If you did not create an account, you can ignore this message.</p>
    `.trim(),
  });
  if (result.error) return { error: result.error.message };
  return {};
}

/**
 * Send password reset link.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<{ error?: string }> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.log("[auth-email] Password reset link (no RESEND_API_KEY):", resetUrl);
    }
    return { error: "RESEND_API_KEY is not set" };
  }
  const result = await resend.emails.send({
    from: getFrom(),
    to: [to],
    subject: "Reset your ArcWealth password",
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${escapeHtml(resetUrl)}">Choose a new password</a></p>
      <p>This link expires in 1 hour. If you did not ask for a reset, ignore this email.</p>
    `.trim(),
  });
  if (result.error) return { error: result.error.message };
  return {};
}
