import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "./session";

/** Signed-in user id from session JWT (`usr_*`). */
export async function getAppUserId(): Promise<string | null> {
  const s = await getSession();
  return s?.userId ?? null;
}

export type AppUserSyncFields = {
  username?: string;
  imageUrl?: string;
  email?: string;
};

/** Fields used by `ensureUserInSupabase` / sidebar email. */
export async function getAppUserSyncFields(userId: string): Promise<AppUserSyncFields> {
  const supabase = createServiceClient();
  const [{ data: au }, { data: prof }] = await Promise.all([
    supabase.from("auth_user").select("email, first_name, last_name").eq("id", userId).maybeSingle(),
    supabase.from("user_profiles").select("username, avatar_url, email").eq("id", userId).maybeSingle(),
  ]);
  const email = (prof?.email ?? au?.email)?.trim() || undefined;
  const nameFromAuth = [au?.first_name, au?.last_name].filter(Boolean).join(" ").trim() || undefined;
  return {
    username: prof?.username ?? nameFromAuth ?? email?.split("@")[0],
    imageUrl: prof?.avatar_url ?? undefined,
    email,
  };
}

/** Primary email for admin / role checks. */
export async function getAppPrimaryEmail(): Promise<string | null> {
  const userId = await getAppUserId();
  if (!userId) return null;
  const supabase = createServiceClient();
  const { data: prof } = await supabase.from("user_profiles").select("email").eq("id", userId).maybeSingle();
  const pe = prof?.email?.trim().toLowerCase();
  if (pe) return pe;
  const { data: au } = await supabase.from("auth_user").select("email").eq("id", userId).maybeSingle();
  return au?.email?.trim().toLowerCase() ?? null;
}
