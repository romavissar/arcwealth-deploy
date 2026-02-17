import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: link } = await supabase
    .from("student_teacher")
    .select("student_user_id")
    .eq("student_user_id", userId)
    .maybeSingle();
  if (link) {
    return NextResponse.json(
      { error: "Account deletion is not available while you are assigned to a teacher. Contact your teacher or school admin to be removed from the class first." },
      { status: 403 }
    );
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
    await supabase.from("user_profiles").delete().eq("id", userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete account" },
      { status: 500 }
    );
  }
}
