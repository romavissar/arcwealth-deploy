import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAppUserId } from "@/lib/auth/server-user";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function POST() {
  const userId = await getAppUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: link } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("student_user_id", userId)
    .maybeSingle();
  if (link) {
    return NextResponse.json(
      {
        error:
          "Account deletion is not available while you are assigned to a teacher. Contact your teacher or school admin to be removed from the class first.",
      },
      { status: 403 }
    );
  }

  const { error: profErr } = await supabase.from("user_profiles").delete().eq("id", userId);
  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }
  const { error: authErr } = await supabase.from("auth_user").delete().eq("id", userId);
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
