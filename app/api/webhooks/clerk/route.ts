import { createServiceClient } from "@/lib/supabase/server";
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret || !svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing headers or CLERK_WEBHOOK_SECRET", { status: 400 });
  }
  const payload = await req.text();
  const wh = new Webhook(secret);
  let event: { type: string; data: { id: string; username?: string | null; email_addresses?: { email_address: string }[]; image_url?: string } };
  try {
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof event;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  if (event.type !== "user.created") {
    return new Response("OK", { status: 200 });
  }
  const { id, username, email_addresses, image_url } = event.data;
  const usernameStr =
    username ||
    email_addresses?.[0]?.email_address?.split("@")[0]?.slice(0, 20) ||
    "user";
  const safeUsername = usernameStr.replace(/\s+/g, "_").toLowerCase().slice(0, 50);
  const supabase = createServiceClient();
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id,
    username: safeUsername,
    avatar_url: image_url ?? null,
    rank: "novice",
  });
  if (profileError) {
    const unique = `${safeUsername}_${Date.now().toString(36).slice(-6)}`;
    await supabase.from("user_profiles").insert({
      id,
      username: unique,
      avatar_url: image_url ?? null,
      rank: "novice",
    });
  }
  const { data: topics } = await supabase.from("topics").select("topic_id").order("order_index");
  if (topics?.length) {
    const rows = topics.map((t) => ({
      user_id: id,
      topic_id: t.topic_id,
      status: t.topic_id === "1.1.1" ? "available" : "locked",
    }));
    await supabase.from("user_progress").upsert(rows, {
      onConflict: "user_id,topic_id",
      ignoreDuplicates: true,
    });
  }
  return new Response("OK", { status: 200 });
}
