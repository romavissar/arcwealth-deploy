import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { createServiceClient } from "@/lib/supabase/server";
import { getAppleOAuth, OAUTH_COOKIE_APPLE_STATE } from "@/lib/auth/oauth-config";
import { upsertOAuthUser } from "@/lib/auth/oauth-flow";
import { redirectOAuthLoginError, respondOAuthSession } from "@/lib/auth/oauth-finish";

function parseJwtBool(v: unknown): boolean {
  if (v === true) return true;
  if (v === "true") return true;
  return false;
}

export async function POST(req: NextRequest) {
  return handleAppleCallback(req);
}

/** Apple may redirect with GET in some setups; support both. */
export async function GET(req: NextRequest) {
  return handleAppleCallback(req);
}

async function handleAppleCallback(req: NextRequest) {
  const apple = getAppleOAuth();
  const url = new URL(req.url);
  let code: string | null = url.searchParams.get("code");
  let state: string | null = url.searchParams.get("state");
  let err = url.searchParams.get("error");

  if (!code && req.method === "POST") {
    try {
      const body = await req.formData();
      code = body.get("code") as string | null;
      state = body.get("state") as string | null;
      err = (body.get("error") as string | null) ?? err;
    } catch {
      return redirectOAuthLoginError("body");
    }
  }

  if (err) return redirectOAuthLoginError(err);
  if (!code || !state) return redirectOAuthLoginError("missing");

  const store = await cookies();
  const savedState = store.get(OAUTH_COOKIE_APPLE_STATE)?.value;
  store.delete(OAUTH_COOKIE_APPLE_STATE);
  if (!savedState || savedState !== state) {
    return redirectOAuthLoginError("state");
  }
  if (!apple) return redirectOAuthLoginError("apple_config");

  let tokens;
  try {
    tokens = await apple.validateAuthorizationCode(code);
  } catch {
    return redirectOAuthLoginError("token");
  }

  const idTokenRaw = tokens.idToken();
  if (!idTokenRaw) return redirectOAuthLoginError("no_id_token");

  let payload: Record<string, unknown>;
  try {
    payload = decodeJwt(idTokenRaw) as Record<string, unknown>;
  } catch {
    return redirectOAuthLoginError("id_token");
  }

  const sub = typeof payload.sub === "string" ? payload.sub : "";
  if (!sub) return redirectOAuthLoginError("no_sub");

  const email = typeof payload.email === "string" ? payload.email : undefined;
  const emailVerified = parseJwtBool(payload.email_verified);

  if (!email) {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from("oauth_account")
      .select("user_id")
      .eq("provider", "apple")
      .eq("provider_account_id", sub)
      .maybeSingle();
    if (!row?.user_id) {
      return redirectOAuthLoginError(
        "apple_no_email",
        "Sign in with Apple did not return an email. Use the same Apple ID you used for your first sign-in, or add email scope on first authorization.",
      );
    }
    try {
      return await respondOAuthSession(row.user_id);
    } catch {
      return redirectOAuthLoginError("session");
    }
  }

  const result = await upsertOAuthUser({
    provider: "apple",
    providerAccountId: sub,
    email,
    emailVerified,
    firstName: null,
    lastName: null,
    picture: null,
  });
  if (!result.ok) {
    return redirectOAuthLoginError(result.code === "link_denied" ? "link_denied" : "db", result.message);
  }
  try {
    return await respondOAuthSession(result.userId);
  } catch {
    return redirectOAuthLoginError("session");
  }
}
