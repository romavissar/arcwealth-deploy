-- Wave 1 (auth-replace-clerk): canonical identity in auth_user; sessions; OAuth accounts; tokens; migration audit.
-- user_profiles.id stays the app-wide FK (Clerk-shaped today, usr_* after migration). No FK auth_user -> user_profiles yet.

CREATE TABLE IF NOT EXISTS auth_user (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified_at TIMESTAMPTZ,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  birth_date DATE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_user_email ON auth_user (email);

CREATE TABLE IF NOT EXISTS auth_session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_user (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_session_user ON auth_session (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_session_expires ON auth_session (expires_at);

CREATE TABLE IF NOT EXISTS oauth_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth_user (id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_account_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_account_user ON oauth_account (user_id);

CREATE TABLE IF NOT EXISTS auth_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth_user (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_token_hash ON auth_token (token_hash);

CREATE TABLE IF NOT EXISTS user_id_migration (
  old_id TEXT PRIMARY KEY,
  new_id TEXT NOT NULL,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_config (key, value)
VALUES ('feature_password_login', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- RLS: deny by default for anon; service role bypasses (app server uses service role today).
ALTER TABLE auth_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_id_migration ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
