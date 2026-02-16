-- Heart regeneration: 1 heart every 5 minutes, cap at max_hearts.
-- last_hearts_at is set when we decrement a heart (or on first use); regeneration is computed from it.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS last_hearts_at TIMESTAMPTZ;

-- Backfill so existing users don't get free regeneration from null
UPDATE user_profiles
SET last_hearts_at = COALESCE(updated_at, now())
WHERE last_hearts_at IS NULL;
