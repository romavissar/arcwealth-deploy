-- Per-user read and dismiss state for any notification (nudge, congrats, friend_request, etc.)

CREATE TABLE IF NOT EXISTS user_notification_state (
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, notification_type, ref_id)
);

CREATE INDEX IF NOT EXISTS idx_user_notification_state_dismissed ON user_notification_state(user_id, dismissed_at);

ALTER TABLE user_notification_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access user_notification_state" ON user_notification_state FOR ALL USING (true) WITH CHECK (true);
