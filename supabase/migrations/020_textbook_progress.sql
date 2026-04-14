CREATE TABLE IF NOT EXISTS user_textbook_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE user_textbook_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own textbook progress" ON user_textbook_progress;
DROP POLICY IF EXISTS "Users can insert own textbook progress" ON user_textbook_progress;
DROP POLICY IF EXISTS "Users can update own textbook progress" ON user_textbook_progress;
DROP POLICY IF EXISTS "Users can delete own textbook progress" ON user_textbook_progress;

CREATE POLICY "Users can view own textbook progress"
ON user_textbook_progress
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own textbook progress"
ON user_textbook_progress
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own textbook progress"
ON user_textbook_progress
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own textbook progress"
ON user_textbook_progress
FOR DELETE
USING (auth.uid()::text = user_id);
