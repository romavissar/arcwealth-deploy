-- Persistent list of teachers (admin-designated). Ensures teachers stay in the list even if
-- user_profiles.role is ever overwritten by sync or other code; sync will re-apply role from this table.

CREATE TABLE IF NOT EXISTS teacher_list (
  user_id TEXT NOT NULL PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_list_user_id ON teacher_list(user_id);

ALTER TABLE teacher_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access teacher_list" ON teacher_list FOR ALL USING (true) WITH CHECK (true);

-- Backfill: anyone who currently has role 'teacher' in user_profiles is in the list
INSERT INTO teacher_list (user_id)
  SELECT id FROM user_profiles WHERE role = 'teacher'
ON CONFLICT (user_id) DO NOTHING;
