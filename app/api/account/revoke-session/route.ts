import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAppUserId } from "@/lib/auth/server-user";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const userId = await getAppUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { sessionId } = body;
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const current = await getSession();
  if (sessionId === current?.sessionId) {
    return NextResponse.json({ error: "Use Sign out to end this session" }, { status: 400 });
  }
  const supabase = createServiceClient();
  const { data: row, error: findErr } = await supabase
    .from("auth_session")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const { error: delErr } = await supabase.from("auth_session").delete().eq("id", sessionId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
