import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getAppUserId } from "@/lib/auth/server-user";
import { getSession, revokeOtherSessions } from "@/lib/auth/session";

export async function POST(req: Request) {
  const userId = await getAppUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { currentPassword, newPassword } = body;
  if (!currentPassword || typeof currentPassword !== "string") {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 });
  }
  if (!newPassword || typeof newPassword !== "string") {
    return NextResponse.json({ error: "New password is required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row } = await supabase.from("auth_user").select("password_hash").eq("id", userId).maybeSingle();
  if (!row?.password_hash) {
    return NextResponse.json(
      { error: "Password login is not enabled for this account" },
      { status: 400 }
    );
  }
  const ok = await verifyPassword(currentPassword, row.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  const newHash = await hashPassword(newPassword);
  const { error: updErr } = await supabase
    .from("auth_user")
    .update({ password_hash: newHash, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }
  const s = await getSession();
  if (s) await revokeOtherSessions(userId, s.sessionId);
  return NextResponse.json({ ok: true });
}
