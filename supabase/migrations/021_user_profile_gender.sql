ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS gender TEXT;

-- Optional, lightweight integrity check for allowed values.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_gender_check'
  ) THEN
    ALTER TABLE user_profiles
      ADD CONSTRAINT user_profiles_gender_check
      CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other', 'Prefer not to say'));
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
