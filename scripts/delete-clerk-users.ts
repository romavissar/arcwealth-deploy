#!/usr/bin/env tsx
import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

type Flags = {
  dryRun: boolean;
  yes: boolean;
};

function parseFlags(argv: string[]): Flags {
  const args = argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    yes: args.includes("--yes"),
  };
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRole) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function run() {
  const { dryRun, yes } = parseFlags(process.argv);
  const supabase = getAdminClient();

  const [{ data: profiles, error: profilesErr }, { data: authUsers, error: authErr }] = await Promise.all([
    supabase.from("user_profiles").select("id, email"),
    supabase.from("auth_user").select("id"),
  ]);

  if (profilesErr) {
    throw new Error(`Failed loading user_profiles: ${profilesErr.message}`);
  }
  if (authErr) {
    throw new Error(`Failed loading auth_user: ${authErr.message}`);
  }

  const authIds = new Set((authUsers ?? []).map((u) => u.id));
  const legacyClerkUsers = (profiles ?? []).filter((p) => !authIds.has(p.id));

  console.log(`Total profiles: ${(profiles ?? []).length}`);
  console.log(`Supabase auth users (auth_user): ${(authUsers ?? []).length}`);
  console.log(`Legacy non-Supabase profiles detected: ${legacyClerkUsers.length}`);

  if (legacyClerkUsers.length > 0) {
    const preview = legacyClerkUsers.slice(0, 20).map((u) => `${u.id}${u.email ? ` (${u.email})` : ""}`);
    console.log("Sample users to delete:");
    for (const row of preview) console.log(` - ${row}`);
    if (legacyClerkUsers.length > preview.length) {
      console.log(` ... and ${legacyClerkUsers.length - preview.length} more`);
    }
  }

  if (dryRun || legacyClerkUsers.length === 0) {
    console.log(dryRun ? "Dry run complete. No rows deleted." : "Nothing to delete.");
    return;
  }

  if (!yes) {
    console.log("Refusing to delete without --yes. Re-run with:");
    console.log("  npm run delete_clerk_users -- --yes");
    return;
  }

  const legacyIds = legacyClerkUsers.map((u) => u.id);
  const { error: deleteErr } = await supabase.from("user_profiles").delete().in("id", legacyIds);
  if (deleteErr) {
    throw new Error(`Failed deleting legacy users: ${deleteErr.message}`);
  }

  console.log(`Deleted ${legacyIds.length} legacy Clerk profile(s) from user_profiles.`);
  console.log("Done.");
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`delete-clerk-users failed: ${message}`);
  process.exitCode = 1;
});
