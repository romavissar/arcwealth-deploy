import { getTutorialStateForUser } from "@/lib/onboarding/tutorial-state";

export function resolvePostAuthRouteFromState(
  requestedPath: string | null | undefined,
  shouldShowTutorial: boolean
): string {
  if (requestedPath && requestedPath !== "/dashboard") {
    return requestedPath;
  }
  if (shouldShowTutorial) {
    return "/welcome";
  }
  return requestedPath ?? "/dashboard";
}

export async function resolvePostAuthRoute(userId: string, requestedPath?: string | null): Promise<string> {
  const tutorialState = await getTutorialStateForUser(userId);
  return resolvePostAuthRouteFromState(requestedPath, tutorialState.shouldShowTutorial);
}
