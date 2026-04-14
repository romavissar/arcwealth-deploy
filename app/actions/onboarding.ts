"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAppPrimaryEmail, getAppUserId } from "@/lib/auth/server-user";
import {
  getTutorialStateForUser,
  markTutorialCompleted,
  markTutorialSkipped,
  markTutorialStarted,
} from "@/lib/onboarding/tutorial-state";
import { canReplayTutorialForEmail } from "@/lib/onboarding/replay-access";

export type MyTutorialState = Awaited<ReturnType<typeof getMyTutorialState>>;

export async function getMyTutorialState() {
  const userId = await getAppUserId();
  if (!userId) return null;
  return getTutorialStateForUser(userId);
}

export async function startTutorialAndGoAction(): Promise<never> {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");
  await markTutorialStarted(userId);
  revalidatePath("/welcome");
  revalidatePath("/dashboard");
  redirect("/dashboard?tour=1&step=dashboard-top-metrics");
}

export async function skipTutorialAndGoAction(): Promise<never> {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");
  await markTutorialSkipped(userId);
  revalidatePath("/welcome");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function restartTutorialFromDashboardAction(): Promise<never> {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");
  const primaryEmail = await getAppPrimaryEmail();
  if (!canReplayTutorialForEmail(primaryEmail)) {
    redirect("/dashboard");
  }
  await markTutorialStarted(userId);
  revalidatePath("/dashboard");
  redirect("/dashboard?tour=1&step=dashboard-top-metrics");
}

export async function completeTutorialAction(): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await getAppUserId();
  if (!userId) return { ok: false, error: "Unauthorized." };
  await markTutorialCompleted(userId);
  revalidatePath("/dashboard");
  revalidatePath("/welcome");
  return { ok: true };
}

export async function skipTutorialAction(): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await getAppUserId();
  if (!userId) return { ok: false, error: "Unauthorized." };
  await markTutorialSkipped(userId);
  revalidatePath("/dashboard");
  revalidatePath("/welcome");
  return { ok: true };
}
