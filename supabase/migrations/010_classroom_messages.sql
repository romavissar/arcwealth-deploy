-- Classroom announcements/messages (teacher -> all students in class)

CREATE TABLE IF NOT EXISTS classroom_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classroom_messages_teacher ON classroom_messages(teacher_user_id);

ALTER TABLE classroom_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access classroom_messages" ON classroom_messages FOR ALL USING (true) WITH CHECK (true);
