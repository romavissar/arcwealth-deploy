-- Delete all users and their related data (progress, xp_events, achievements).
-- Child tables use ON DELETE CASCADE, so deleting from user_profiles is enough.
DELETE FROM user_profiles;
