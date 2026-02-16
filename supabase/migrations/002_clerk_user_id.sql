-- Clerk user IDs are strings (e.g. user_2xxx), not UUIDs.
-- Drop Supabase Auth FK and change user_profiles.id to TEXT.
-- Run this after 001_initial.sql. If you have existing data, backup first.
-- Must drop RLS policies that depend on id/user_id before altering column types.

-- Drop RLS policies that reference user_profiles.id or user_id columns
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own xp_events" ON xp_events;
DROP POLICY IF EXISTS "Users can insert own xp_events" ON xp_events;
DROP POLICY IF EXISTS "Users can view own user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own user_achievements" ON user_achievements;

-- Drop FKs that reference user_profiles(id)
ALTER TABLE user_progress   DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE xp_events       DROP CONSTRAINT IF EXISTS xp_events_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

-- Drop FK from user_profiles to auth.users (name may vary)
ALTER TABLE user_profiles   DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Change user_profiles.id from UUID to TEXT
ALTER TABLE user_profiles   ALTER COLUMN id TYPE TEXT USING id::text;

-- Change referencing columns to TEXT
ALTER TABLE user_progress   ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE xp_events       ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE user_achievements ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- Re-add FKs
ALTER TABLE user_progress   ADD CONSTRAINT user_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE xp_events       ADD CONSTRAINT xp_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Re-create RLS policies (app uses service role; these document row-level rules)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own xp_events" ON xp_events FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own xp_events" ON xp_events FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view own user_achievements" ON user_achievements FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own user_achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid()::text = user_id);
