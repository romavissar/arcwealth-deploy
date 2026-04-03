-- Wave 4: TOTP 2FA + one-time recovery codes (hashed at rest).

ALTER TABLE auth_user
  ADD COLUMN IF NOT EXISTS totp_secret_encrypted TEXT;

CREATE TABLE IF NOT EXISTS auth_recovery_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth_user (id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_recovery_code_user ON auth_recovery_code (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_recovery_code_hash ON auth_recovery_code (code_hash);

ALTER TABLE auth_recovery_code ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access auth_recovery_code" ON auth_recovery_code FOR ALL USING (true) WITH CHECK (true);
