import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
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

  try {
    const client = await clerkClient();
    await client.users.verifyPassword({ userId, password: currentPassword });
    await client.users.updateUser(userId, {
      password: newPassword,
      signOutOfOtherSessions: true,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("verify")) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update password" },
      { status: 500 }
    );
  }
}
