import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function getFrom(): string {
  const from = process.env.RESEND_FROM ?? "ArcWealth <onboarding@resend.dev>";
  return from.trim();
}

/**
 * Send a nudge notification email to a student.
 * Returns error if RESEND_API_KEY is not set or Resend API fails.
 */
export async function sendNudgeEmail(
  to: string,
  teacherName: string,
  lessonLabel: string
): Promise<{ error?: string }> {
  const resend = getResend();
  if (!resend) return { error: "RESEND_API_KEY is not set" };
  const from = getFrom();
  if (process.env.NODE_ENV === "development") {
    console.log("[Resend] Sending nudge email to", to, "from", from);
  }
  const result = await resend.emails.send({
    from,
    to: [to],
    subject: `${teacherName} nudged you to continue learning`,
    html: `
      <p>Your teacher <strong>${escapeHtml(teacherName)}</strong> nudged you to complete <strong>${escapeHtml(lessonLabel)}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000"}/learn">Continue in ArcWealth</a></p>
    `.trim(),
  });
  if (process.env.NODE_ENV === "development") {
    console.log("[Resend] Nudge result:", result.error ? `Error: ${result.error.message}` : "OK");
  }
  if (result.error) return { error: result.error.message };
  return {};
}

/**
 * Send a congratulations notification email to a student.
 * Returns error if RESEND_API_KEY is not set or Resend API fails.
 */
export async function sendCongratulationsEmail(
  to: string,
  teacherName: string
): Promise<{ error?: string }> {
  const resend = getResend();
  if (!resend) return { error: "RESEND_API_KEY is not set" };
  const from = getFrom();
  if (process.env.NODE_ENV === "development") {
    console.log("[Resend] Sending congratulations email to", to, "from", from);
  }
  const result = await resend.emails.send({
    from,
    to: [to],
    subject: `${teacherName} congratulated you!`,
    html: `
      <p>Your teacher <strong>${escapeHtml(teacherName)}</strong> congratulated you on your progress.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000"}/dashboard">View your progress in ArcWealth</a></p>
    `.trim(),
  });
  if (process.env.NODE_ENV === "development") {
    console.log("[Resend] Congratulations result:", result.error ? `Error: ${result.error.message}` : "OK");
  }
  if (result.error) return { error: result.error.message };
  return {};
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000";
}

/**
 * Notify a student that their teacher posted a classroom announcement.
 */
export async function sendClassroomAnnouncementEmail(
  to: string,
  teacherName: string,
  contentPreview: string
): Promise<{ error?: string }> {
  const resend = getResend();
  if (!resend) return { error: "RESEND_API_KEY is not set" };
  const from = getFrom();
  const preview = contentPreview.length > 200 ? contentPreview.slice(0, 197) + "..." : contentPreview;
  if (process.env.NODE_ENV === "development") {
    console.log("[Resend] Sending classroom announcement email to", to);
  }
  const result = await resend.emails.send({
    from,
    to: [to],
    subject: `New announcement from ${teacherName}`,
    html: `
      <p>Your teacher <strong>${escapeHtml(teacherName)}</strong> posted a new announcement:</p>
      <p>${escapeHtml(preview)}</p>
      <p><a href="${appUrl()}/classroom">View in Classroom</a></p>
    `.trim(),
  });
  if (result.error) return { error: result.error.message };
  return {};
}

/**
 * Notify a student that their teacher assigned a new assignment.
 */
export async function sendClassroomAssignmentEmail(
  to: string,
  teacherName: string,
  assignmentLabel: string,
  dueDisplay: string
): Promise<{ error?: string }> {
  const resend = getResend();
  if (!resend) return { error: "RESEND_API_KEY is not set" };
  const from = getFrom();
  if (process.env.NODE_ENV === "development") {
    console.log("[Resend] Sending classroom assignment email to", to);
  }
  const result = await resend.emails.send({
    from,
    to: [to],
    subject: `New assignment from ${teacherName}: ${assignmentLabel}`,
    html: `
      <p>Your teacher <strong>${escapeHtml(teacherName)}</strong> assigned a new task:</p>
      <p><strong>${escapeHtml(assignmentLabel)}</strong></p>
      <p>Due: ${escapeHtml(dueDisplay)}</p>
      <p><a href="${appUrl()}/classroom">Open Classroom</a></p>
    `.trim(),
  });
  if (result.error) return { error: result.error.message };
  return {};
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
