-- Mark congratulations as read when the student marks as done in the notification center

ALTER TABLE teacher_congratulations
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_teacher_congratulations_read_at ON teacher_congratulations(student_user_id, read_at);
