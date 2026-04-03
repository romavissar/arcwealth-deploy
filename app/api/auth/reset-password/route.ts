import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { isPasswordLoginEnabled } from "@/lib/auth/app-config";
import { deleteAllSessionsForUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isPasswordLoginEnabled())) {
    return NextResponse.json({ error: "Password login is disabled." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const token = String((body as { token?: string }).token ?? "");
  const password = String((body as { password?: string }).password ?? "");
  if (!token || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("auth_token")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", hashToken(token))
    .eq("purpose", "password_reset")
    .maybeSingle();

  if (!row || row.used_at) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired." }, { status: 400 });
  }

  const newHash = await hashPassword(password);
  const now = new Date().toISOString();
  await supabase.from("auth_user").update({ password_hash: newHash, updated_at: now }).eq("id", row.user_id);
  await supabase.from("auth_token").update({ used_at: now }).eq("id", row.id);
  await deleteAllSessionsForUser(row.user_id);

  return NextResponse.json({ ok: true });
}
