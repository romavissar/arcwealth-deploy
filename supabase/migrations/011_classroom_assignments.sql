-- Classroom assignments (complete topic X by due date)

CREATE TABLE IF NOT EXISTS classroom_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classroom_assignments_teacher ON classroom_assignments(teacher_user_id);

ALTER TABLE classroom_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access classroom_assignments" ON classroom_assignments FOR ALL USING (true) WITH CHECK (true);
