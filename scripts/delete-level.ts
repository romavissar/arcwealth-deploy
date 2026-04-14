#!/usr/bin/env tsx
import "dotenv/config";

import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

interface CliFlags {
  noDb: boolean;
  keepArtifact: boolean;
}

function parseArgs(argv: string[]): { lessonArg: string; flags: CliFlags } {
  const args = argv.slice(2);
  const lessonArg = args.find((arg) => !arg.startsWith("--"));
  if (!lessonArg) {
    throw new Error('Missing lesson argument. Usage: npm run delete_level -- lesson_1.md [--no-db] [--keep-artifact]');
  }

  return {
    lessonArg,
    flags: {
      noDb: args.includes("--no-db"),
      keepArtifact: args.includes("--keep-artifact"),
    },
  };
}

function lessonArgToTopicId(lessonArg: string): { lessonFile: string; topicId: string } {
  const asTopic = lessonArg.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (asTopic) {
    return { lessonFile: lessonArg, topicId: lessonArg };
  }

  const asModuleLesson = lessonArg.match(/^M(\d+)-L(\d+)$/i);
  if (asModuleLesson) {
    const topicId = `${Number(asModuleLesson[1])}.1.${Number(asModuleLesson[2])}`;
    return { lessonFile: lessonArg, topicId };
  }

  const lessonFile = path.basename(lessonArg);
  const asLegacyFile = lessonFile.match(/^lesson_(\d+)\.md$/i);
  if (!asLegacyFile) {
    throw new Error(
      `Invalid lesson argument "${lessonArg}". Expected topic id (1.1.1), Mx-Ly (M1-L1), or lesson_<number>.md`
    );
  }

  const lessonNumber = Number(asLegacyFile[1]);
  return { lessonFile, topicId: `1.1.${lessonNumber}` };
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRole) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function deleteLearnContent(topicId: string): Promise<number> {
  const client = getAdminClient();
  const learnTypes = ["duolingo_lesson", "quiz"] as const;

  let deletedCount = 0;
  for (const contentType of learnTypes) {
    const res = await client.from("lesson_content").delete().eq("topic_id", topicId).eq("content_type", contentType);
    if (res.error) {
      throw new Error(`Failed deleting ${contentType} for ${topicId}: ${JSON.stringify(res.error)}`);
    }
    deletedCount += 1;
  }

  return deletedCount;
}

async function deleteGeneratedArtifact(topicId: string): Promise<boolean> {
  const artifactName = `${topicId.replace(/\./g, "_")}.level.json`;
  const artifactPath = path.join(process.cwd(), "generated", "levels", artifactName);
  try {
    await fs.unlink(artifactPath);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return false;
    throw error;
  }
}

async function run() {
  const { lessonArg, flags } = parseArgs(process.argv);
  const { lessonFile, topicId } = lessonArgToTopicId(lessonArg);

  let dbDeleted = 0;
  if (!flags.noDb) {
    dbDeleted = await deleteLearnContent(topicId);
  }

  let artifactDeleted = false;
  if (!flags.keepArtifact) {
    artifactDeleted = await deleteGeneratedArtifact(topicId);
  }

  console.log(`Deleted learn level for ${lessonFile} (${topicId}).`);
  console.log(`DB delete executed: ${flags.noDb ? "no (--no-db)" : `yes (${dbDeleted} content type(s))`}`);
  console.log(`Artifact deleted: ${flags.keepArtifact ? "no (--keep-artifact)" : artifactDeleted ? "yes" : "not found"}`);
  console.log("Textbook markdown/content unchanged.");
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`delete_level failed: ${message}`);
  process.exitCode = 1;
});
