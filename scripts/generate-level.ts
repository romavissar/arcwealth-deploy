#!/usr/bin/env tsx
import "dotenv/config";

import { refineLevelWithAi } from "../lib/level-generation/ai";
import { buildDeterministicLevel, loadLessonContext } from "../lib/level-generation/parser";
import { persistGeneratedLevel } from "../lib/level-generation/persist";
import { validateGeneratedLevel } from "../lib/level-generation/validator";

interface CliFlags {
  deterministicOnly: boolean;
  noDb: boolean;
  moduleOneAndModuleTwoIntro: boolean;
}

function parseArgs(argv: string[]): { lessonArg: string | null; flags: CliFlags } {
  const args = argv.slice(2);
  const lessonArg = args.find((arg) => !arg.startsWith("--"));
  const moduleOneAndModuleTwoIntro = args.includes("--module1-and-module2-intro");
  if (!lessonArg && !moduleOneAndModuleTwoIntro) {
    throw new Error(
      "Missing lesson argument. Usage: npm run generate_level -- lesson_1.md [--deterministic-only] [--no-db] or --module1-and-module2-intro"
    );
  }

  return {
    lessonArg: lessonArg ?? null,
    flags: {
      deterministicOnly: args.includes("--deterministic-only"),
      noDb: args.includes("--no-db"),
      moduleOneAndModuleTwoIntro,
    },
  };
}

function getBatchTargets(flags: CliFlags, lessonArg: string | null): string[] {
  if (flags.moduleOneAndModuleTwoIntro) {
    return [...Array.from({ length: 10 }, (_, index) => `1.1.${index + 1}`), "2.1.1"];
  }
  if (!lessonArg) {
    throw new Error("Missing lesson argument");
  }
  return [lessonArg];
}

async function generateSingleTarget(lessonArg: string, flags: CliFlags) {
  const context = await loadLessonContext(lessonArg);

  const deterministic = buildDeterministicLevel(context);
  let candidate = deterministic;
  let usedAi = false;

  if (!flags.deterministicOnly) {
    try {
      candidate = await refineLevelWithAi(deterministic, context.markdown);
      usedAi = true;
      console.log("AI refinement applied via OpenRouter.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`AI refinement skipped: ${message}`);
    }
  } else {
    console.log("Deterministic-only mode enabled.");
  }

  let validatedLevel;
  try {
    validatedLevel = validateGeneratedLevel(candidate);
  } catch (error) {
    if (usedAi) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`AI draft failed validation, falling back to deterministic: ${message}`);
      validatedLevel = validateGeneratedLevel(deterministic);
    } else {
      throw error;
    }
  }

  return persistGeneratedLevel(validatedLevel, { noDb: flags.noDb });
}

async function run() {
  const { lessonArg, flags } = parseArgs(process.argv);
  const targets = getBatchTargets(flags, lessonArg);
  const results: Array<{ lessonArg: string; artifactPath: string; dbWritten: boolean }> = [];

  for (const target of targets) {
    const result = await generateSingleTarget(target, flags);
    results.push({
      lessonArg: target,
      artifactPath: result.artifactPath,
      dbWritten: result.dbWritten,
    });
  }

  for (const result of results) {
    console.log(`Generated level for ${result.lessonArg}.`);
    console.log(`Artifact written: ${result.artifactPath}`);
    console.log(`Database write: ${result.dbWritten ? "yes" : "no (--no-db)"}`);
  }
  console.log(`Done. Generated ${results.length} level(s).`);
}

run().catch((error) => {
  const message =
    error instanceof Error
      ? error.message
      : (() => {
          try {
            return JSON.stringify(error);
          } catch {
            return String(error);
          }
        })();
  console.error(`generate_level failed: ${message}`);
  process.exitCode = 1;
});
