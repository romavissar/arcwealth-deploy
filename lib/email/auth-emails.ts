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

type SendVerificationInput = {
  verificationCode: string;
  verifyUrl: string;
};

/**
 * Send email verification code + fallback link.
 * In dev without RESEND_API_KEY, logs both values.
 */
export async function sendVerificationEmail(to: string, input: SendVerificationInput): Promise<{ error?: string }> {
  const { verificationCode, verifyUrl } = input;
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.log("[auth-email] Verification link (no RESEND_API_KEY):", verifyUrl);
      console.log("[auth-email] Verification code (no RESEND_API_KEY):", verificationCode);
    }
    return { error: "RESEND_API_KEY is not set" };
  }
  const result = await resend.emails.send({
    from: getFrom(),
    to: [to],
    subject: "Verify your ArcWealth email",
    html: `
      <p>Hi ${escapeHtml(to.split("@")[0])},</p>
      <p>Use this 6-digit code to verify your email:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 2px;">${escapeHtml(verificationCode)}</p>
      <p>You can also verify using this link:</p>
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

type SendGuardianNotificationInput = {
  studentName: string;
  studentEmail: string;
  school?: string;
};

/**
 * Notify guardian that a student account was created.
 */
export async function sendGuardianRegistrationNotice(
  to: string,
  input: SendGuardianNotificationInput
): Promise<{ error?: string }> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.log("[auth-email] Guardian notice (no RESEND_API_KEY):", { to, ...input });
    }
    return { error: "RESEND_API_KEY is not set" };
  }

  const result = await resend.emails.send({
    from: getFrom(),
    to: [to],
    subject: "ArcWealth registration notification",
    html: `
      <p>Hello,</p>
      <p>This is to let you know that ${escapeHtml(input.studentName)} has registered for ArcWealth.</p>
      <p><strong>Student email:</strong> ${escapeHtml(input.studentEmail)}</p>
      ${input.school ? `<p><strong>School:</strong> ${escapeHtml(input.school)}</p>` : ""}
      <p>If this registration was not expected, please contact support.</p>
      <p><a href="${escapeHtml(appUrl())}">Visit ArcWealth</a></p>
    `.trim(),
  });
  if (result.error) return { error: result.error.message };
  return {};
}
