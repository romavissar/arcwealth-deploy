-- Teacher nudges: teacher can nudge a student to do the next lesson

CREATE TABLE IF NOT EXISTS teacher_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  next_topic_id TEXT REFERENCES topics(topic_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_nudges_student ON teacher_nudges(student_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_nudges_teacher ON teacher_nudges(teacher_user_id);

ALTER TABLE teacher_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access teacher_nudges" ON teacher_nudges FOR ALL USING (true) WITH CHECK (true);
