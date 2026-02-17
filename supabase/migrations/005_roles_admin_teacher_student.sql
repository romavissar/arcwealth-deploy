-- Roles, admin config, and student-teacher links

-- Add role and email to user_profiles (email for admin/student matching)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'teacher', 'student', 'user')),
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Single-row config for admin: allowed student email suffixes (e.g. @student.goaisb.ro)
CREATE TABLE IF NOT EXISTS admin_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  allowed_student_email_endings JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO admin_config (id, allowed_student_email_endings)
VALUES (1, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Student -> Teacher assignment (one teacher per student)
CREATE TABLE IF NOT EXISTS student_teacher (
  student_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  teacher_user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_user_id)
);

CREATE INDEX IF NOT EXISTS idx_student_teacher_teacher ON student_teacher(teacher_user_id);

-- RLS: app uses service role for server-side; these document intent for future auth
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_teacher ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access admin_config" ON admin_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access student_teacher" ON student_teacher FOR ALL USING (true) WITH CHECK (true);
