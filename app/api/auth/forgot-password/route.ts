import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { isPasswordLoginEnabled } from "@/lib/auth/app-config";
import { sendPasswordResetEmail } from "@/lib/email/auth-emails";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isPasswordLoginEnabled())) {
    return NextResponse.json({ error: "Password login is disabled." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String((body as { email?: string }).email ?? "")
    .toLowerCase()
    .trim();
  if (!email) {
    return NextResponse.json({ ok: true });
  }

  if (!checkRateLimit(`forgot:${email}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from("auth_user")
    .select("id, email, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (!user?.password_hash) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("auth_token").delete().eq("user_id", user.id).eq("purpose", "password_reset");

  const raw = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("auth_token").insert({
    user_id: user.id,
    token_hash: hashToken(raw),
    purpose: "password_reset",
    expires_at: expiresAt,
  });
  if (error) {
    return NextResponse.json({ ok: true });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${base}/credentials/reset-password?token=${encodeURIComponent(raw)}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return NextResponse.json({ ok: true });
}
