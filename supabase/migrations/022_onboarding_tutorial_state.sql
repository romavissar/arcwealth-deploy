ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS tutorial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tutorial_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tutorial_skipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tutorial_version INT NOT NULL DEFAULT 1;

-- Mark pre-existing users as already onboarded to avoid forcing a new flow.
UPDATE user_profiles
SET tutorial_completed_at = COALESCE(tutorial_completed_at, now())
WHERE created_at < now();

NOTIFY pgrst, 'reload schema';
