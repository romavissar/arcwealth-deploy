-- Mark nudges as read when the student completes the nudged lesson (used to hide dashboard popup and style notifications)

ALTER TABLE teacher_nudges
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_teacher_nudges_read_at ON teacher_nudges(student_user_id, read_at);
