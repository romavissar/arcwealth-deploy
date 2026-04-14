-- Display names may match across users; identity is always user_profiles.id.
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_username_key;

-- If the constraint was auto-named differently, drop the single-column UNIQUE on username.
DO $$
DECLARE
  conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class rel ON rel.oid = c.conrelid
  WHERE rel.relname = 'user_profiles'
    AND c.contype = 'u'
    AND cardinality(c.conkey) = 1
    AND EXISTS (
      SELECT 1
      FROM pg_attribute a
      WHERE a.attrelid = c.conrelid
        AND a.attnum = c.conkey[1]
        AND a.attname = 'username'
    )
  LIMIT 1;
  IF conname IS NOT NULL AND conname IS DISTINCT FROM 'user_profiles_username_key' THEN
    EXECUTE format('ALTER TABLE user_profiles DROP CONSTRAINT %I', conname);
  END IF;
END $$;
