"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/auth/tokens";

const PARENTAL_AGREEMENT_VERSION = "2026-04-15";

const authorizeSchema = z.object({
  token: z.string().min(1),
  parentFullName: z.string().trim().min(2).max(160),
  confirmed: z.preprocess(
    (value) => value === "on" || value === "true",
    z.literal(true, { errorMap: () => ({ message: "You must confirm authorization to continue." }) })
  ),
});

export type ParentAuthorizeState =
  | null
  | {
      success?: string;
      error?: string;
    };

export async function submitParentalAuthorization(
  _prev: ParentAuthorizeState,
  formData: FormData
): Promise<ParentAuthorizeState> {
  const parsed = authorizeSchema.safeParse({
    token: formData.get("token"),
    parentFullName: formData.get("parentFullName"),
    confirmed: formData.get("confirmed"),
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Invalid authorization data." };
  }

  const { token, parentFullName } = parsed.data;
  const supabase = createServiceClient();
  const { data: tokenRow } = await supabase
    .from("auth_token")
    .select("id, user_id, used_at, expires_at")
    .eq("token_hash", hashToken(token))
    .eq("purpose", "parental_approval")
    .maybeSingle();

  if (!tokenRow || tokenRow.used_at) {
    return { error: "This parental authorization link is invalid or already used." };
  }
  if (new Date(tokenRow.expires_at) < new Date()) {
    return { error: "This parental authorization link has expired. Ask the student to request a new one." };
  }

  const now = new Date().toISOString();
  const { error: profileUpdateError } = await supabase
    .from("auth_user")
    .update({
      parental_approved_at: now,
      parental_approver_name: parentFullName,
      parental_agreement_version: PARENTAL_AGREEMENT_VERSION,
      updated_at: now,
    })
    .eq("id", tokenRow.user_id);

  if (profileUpdateError) {
    return { error: "Could not record parental authorization. Please try again." };
  }

  const { error: tokenUpdateError } = await supabase.from("auth_token").update({ used_at: now }).eq("id", tokenRow.id);
  if (tokenUpdateError) {
    return { error: "Authorization was recorded, but token finalization failed. Please contact support." };
  }

  return { success: "Authorization complete. Your child can now sign in once their email is verified." };
}
