#!/usr/bin/env tsx
import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

import { buildGlossaryFromCurrentTextbook } from "../lib/glossary-from-textbook";
import type { Database } from "../types/database";

interface CliFlags {
  dryRun: boolean;
  pruneStale: boolean;
}

function parseArgs(argv: string[]): CliFlags {
  const args = argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    pruneStale: args.includes("--prune-stale"),
  };
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRole) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function run() {
  const flags = parseArgs(process.argv);
  const supabase = createAdminClient();
  const extracted = await buildGlossaryFromCurrentTextbook(supabase);

  const { data: existingRows, error: existingError } = await supabase.from("glossary").select("term");
  if (existingError) {
    throw new Error(`Failed reading existing glossary terms: ${existingError.message}`);
  }

  const extractedTermSet = new Set(extracted.map((entry) => entry.term.toLowerCase()));
  const staleTerms = (existingRows ?? [])
    .map((row) => row.term)
    .filter((term) => !extractedTermSet.has(term.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  console.log(`Prepared ${extracted.length} terms from current textbook lessons.`);
  if (staleTerms.length > 0) {
    console.log(`Found ${staleTerms.length} stale existing glossary terms not in current extraction.`);
    staleTerms.slice(0, 20).forEach((term) => console.log(` - ${term}`));
    if (staleTerms.length > 20) {
      console.log(` - ...and ${staleTerms.length - 20} more`);
    }
  } else {
    console.log("No stale terms detected.");
  }

  if (flags.dryRun) {
    console.log("Dry run enabled; no database changes were made.");
    return;
  }

  const { error: upsertError } = await supabase.from("glossary").upsert(extracted, { onConflict: "term" });
  if (upsertError) {
    throw new Error(`Failed upserting extracted glossary terms: ${upsertError.message}`);
  }

  let deletedCount = 0;
  if (flags.pruneStale && staleTerms.length > 0) {
    const { error: deleteError, count } = await supabase
      .from("glossary")
      .delete({ count: "exact" })
      .in("term", staleTerms);
    if (deleteError) {
      throw new Error(`Failed deleting stale glossary terms: ${deleteError.message}`);
    }
    deletedCount = count ?? 0;
  }

  console.log(`Upserted ${extracted.length} glossary terms.`);
  if (flags.pruneStale) {
    console.log(`Pruned stale terms: ${deletedCount}`);
  } else if (staleTerms.length > 0) {
    console.log("Stale terms were not deleted (default behavior). Re-run with --prune-stale to remove them.");
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`sync_glossary_from_textbook failed: ${message}`);
  process.exitCode = 1;
});
