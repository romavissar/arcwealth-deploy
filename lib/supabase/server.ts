/**
 * Supabase access strategy (Wave 1 auth migration)
 * -----------------------------------------------
 * The app uses the **service role** key on the server (`createServiceClient`) for most reads/writes.
 * Row Level Security policies use `auth.uid()` from **Supabase Auth JWT**, but this app does not
 * rely on end-user Supabase sessions — identity comes from the app’s signed session cookie + JWT.
 * Until RLS is aligned with issued Supabase JWTs or session tokens, treat all authorization as
 * **application-layer** (Server Actions verify user id from the session). Never trust
 * client-supplied user ids. Revisit when moving to Supabase-issued JWTs for `auth.uid()` parity.
 */
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in Server Components
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
