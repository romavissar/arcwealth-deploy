-- Add due time: store due_at (timestamptz) instead of due_date (date). Timezone: Europe/Bucharest (EET).

ALTER TABLE classroom_assignments
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

-- Only backfill and drop due_date if the column still exists (idempotent for re-runs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'classroom_assignments' AND column_name = 'due_date'
  ) THEN
    UPDATE classroom_assignments
    SET due_at = ((due_date::date + time '23:59:59') AT TIME ZONE 'Europe/Bucharest')
    WHERE due_at IS NULL AND due_date IS NOT NULL;

    ALTER TABLE classroom_assignments ALTER COLUMN due_at SET NOT NULL;
    ALTER TABLE classroom_assignments DROP COLUMN due_date;
  END IF;
END $$;
