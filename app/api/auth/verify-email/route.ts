import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/auth/tokens";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", req.url));
  }

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("auth_token")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", hashToken(token))
    .eq("purpose", "email_verification")
    .maybeSingle();

  if (!row || row.used_at) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid", req.url));
  }
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/verify-email?error=expired", req.url));
  }

  const now = new Date().toISOString();
  await supabase.from("auth_user").update({ email_verified_at: now, updated_at: now }).eq("id", row.user_id);
  await supabase.from("auth_token").update({ used_at: now }).eq("id", row.id);

  return NextResponse.redirect(new URL("/verify-email?success=1", req.url));
}
