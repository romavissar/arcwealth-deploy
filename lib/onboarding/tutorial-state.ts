import { createServiceClient } from "@/lib/supabase/server";

export const CURRENT_TUTORIAL_VERSION = 1;

export type TutorialState = {
  userId: string;
  tutorialVersion: number;
  startedAt: string | null;
  completedAt: string | null;
  skippedAt: string | null;
  shouldShowTutorial: boolean;
};

type TutorialRow = {
  tutorial_version: number | null;
  tutorial_started_at: string | null;
  tutorial_completed_at: string | null;
  tutorial_skipped_at: string | null;
};

export function deriveTutorialState(userId: string, row: TutorialRow | null): TutorialState {
  const tutorialVersion = row?.tutorial_version ?? CURRENT_TUTORIAL_VERSION;
  const startedAt = row?.tutorial_started_at ?? null;
  const completedAt = row?.tutorial_completed_at ?? null;
  const skippedAt = row?.tutorial_skipped_at ?? null;
  const isCurrentVersion = tutorialVersion === CURRENT_TUTORIAL_VERSION;
  const shouldShowTutorial = !isCurrentVersion || (!completedAt && !skippedAt);
  return {
    userId,
    tutorialVersion,
    startedAt,
    completedAt,
    skippedAt,
    shouldShowTutorial,
  };
}

export async function getTutorialStateForUser(userId: string): Promise<TutorialState> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("tutorial_version, tutorial_started_at, tutorial_completed_at, tutorial_skipped_at")
    .eq("id", userId)
    .maybeSingle();
  return deriveTutorialState(userId, data as TutorialRow | null);
}

export async function markTutorialStarted(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("user_profiles")
    .update({
      tutorial_version: CURRENT_TUTORIAL_VERSION,
      tutorial_started_at: new Date().toISOString(),
      tutorial_skipped_at: null,
      tutorial_completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function markTutorialCompleted(userId: string): Promise<void> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  await supabase
    .from("user_profiles")
    .update({
      tutorial_version: CURRENT_TUTORIAL_VERSION,
      tutorial_started_at: now,
      tutorial_completed_at: now,
      tutorial_skipped_at: null,
      updated_at: now,
    })
    .eq("id", userId);
}

export async function markTutorialSkipped(userId: string): Promise<void> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  await supabase
    .from("user_profiles")
    .update({
      tutorial_version: CURRENT_TUTORIAL_VERSION,
      tutorial_started_at: now,
      tutorial_completed_at: null,
      tutorial_skipped_at: now,
      updated_at: now,
    })
    .eq("id", userId);
}
