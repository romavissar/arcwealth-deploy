-- Friends: symmetric relationship. One row per pair (user_id_1 < user_id_2) for uniqueness.

CREATE TABLE IF NOT EXISTS friends (
  user_id_1 TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_id_2 TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_friends_user_id_2 ON friends(user_id_2);

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access friends" ON friends FOR ALL USING (true) WITH CHECK (true);
