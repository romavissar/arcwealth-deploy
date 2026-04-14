import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

/** List DB sessions for custom auth (active devices). */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("auth_session")
    .select("id, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const sessions = (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    isCurrent: row.id === session.sessionId,
  }));
  return NextResponse.json({ sessions });
}
