import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAppUserId } from "@/lib/auth/server-user";

const AVATAR_BUCKET = "avatars";

async function ensureAvatarBucket() {
  const supabase = createServiceClient();
  const { data: bucket, error: getBucketError } = await supabase.storage.getBucket(AVATAR_BUCKET);
  if (!getBucketError && bucket) return { supabase };

  const notFound =
    getBucketError?.message?.toLowerCase().includes("not found") ||
    getBucketError?.message?.toLowerCase().includes("does not exist");

  if (!notFound) {
    return {
      error: getBucketError?.message ?? "Could not access avatar storage bucket.",
    };
  }

  const { error: createBucketError } = await supabase.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"],
    fileSizeLimit: 5 * 1024 * 1024,
  });

  if (createBucketError) {
    return {
      error: createBucketError.message ?? "Could not create avatar storage bucket.",
    };
  }

  return { supabase };
}

export async function POST(req: Request) {
  try {
    const userId = await getAppUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file?.size || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar.${ext}`;
    const bucket = await ensureAvatarBucket();
    if ("error" in bucket) {
      return NextResponse.json({ error: bucket.error }, { status: 500 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await bucket.supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, buf, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = bucket.supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const url = urlData.publicUrl;

    await bucket.supabase
      .from("user_profiles")
      .update({ avatar_url: url, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
