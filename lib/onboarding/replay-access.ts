export const TOUR_REPLAY_TEST_EMAIL = "romavissar@outlook.com";

export function canReplayTutorialForEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === TOUR_REPLAY_TEST_EMAIL;
}
