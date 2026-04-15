-- Parent approval gate for minor accounts.
-- Adds parent consent state to auth_user and allows auth_token purpose for parental approval links.

ALTER TABLE auth_user
  ADD COLUMN IF NOT EXISTS parental_approval_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parental_approval_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parental_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parental_approver_name TEXT,
  ADD COLUMN IF NOT EXISTS parental_agreement_version TEXT;

DO $$
DECLARE
  existing_constraint RECORD;
BEGIN
  FOR existing_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'auth_token'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%purpose%'
  LOOP
    EXECUTE format('ALTER TABLE auth_token DROP CONSTRAINT %I', existing_constraint.conname);
  END LOOP;

  ALTER TABLE auth_token
    ADD CONSTRAINT auth_token_purpose_check
    CHECK (purpose IN ('email_verification', 'password_reset', 'parental_approval'));
END
$$;
