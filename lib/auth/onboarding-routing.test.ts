import test from "node:test";
import assert from "node:assert/strict";
import { resolvePostAuthRouteFromState } from "./resolve-post-auth-route";
import { CURRENT_TUTORIAL_VERSION, deriveTutorialState } from "../onboarding/tutorial-state";

test("resolvePostAuthRouteFromState preserves non-dashboard redirect", () => {
  const dest = resolvePostAuthRouteFromState("/learn/topic-1", true);
  assert.equal(dest, "/learn/topic-1");
});

test("resolvePostAuthRouteFromState sends first-run users to welcome", () => {
  const dest = resolvePostAuthRouteFromState("/dashboard", true);
  assert.equal(dest, "/welcome");
});

test("resolvePostAuthRouteFromState defaults to dashboard for returning users", () => {
  const dest = resolvePostAuthRouteFromState(null, false);
  assert.equal(dest, "/dashboard");
});

test("deriveTutorialState marks current finished tutorials as not showable", () => {
  const state = deriveTutorialState("usr_1", {
    tutorial_version: CURRENT_TUTORIAL_VERSION,
    tutorial_started_at: "2026-01-01T00:00:00.000Z",
    tutorial_completed_at: "2026-01-01T00:02:00.000Z",
    tutorial_skipped_at: null,
  });
  assert.equal(state.shouldShowTutorial, false);
});

test("deriveTutorialState marks unfinished current tutorials as showable", () => {
  const state = deriveTutorialState("usr_2", {
    tutorial_version: CURRENT_TUTORIAL_VERSION,
    tutorial_started_at: null,
    tutorial_completed_at: null,
    tutorial_skipped_at: null,
  });
  assert.equal(state.shouldShowTutorial, true);
});

test("deriveTutorialState re-enables tutorial for new version", () => {
  const state = deriveTutorialState("usr_3", {
    tutorial_version: CURRENT_TUTORIAL_VERSION - 1,
    tutorial_started_at: "2025-10-01T00:00:00.000Z",
    tutorial_completed_at: "2025-10-01T00:05:00.000Z",
    tutorial_skipped_at: null,
  });
  assert.equal(state.shouldShowTutorial, true);
});
