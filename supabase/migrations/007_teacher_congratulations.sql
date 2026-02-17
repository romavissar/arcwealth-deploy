-- Teacher congratulations: teacher can congratulate a student on their progress

CREATE TABLE IF NOT EXISTS teacher_congratulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_congratulations_student ON teacher_congratulations(student_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_congratulations_teacher ON teacher_congratulations(teacher_user_id);

ALTER TABLE teacher_congratulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access teacher_congratulations" ON teacher_congratulations FOR ALL USING (true) WITH CHECK (true);
