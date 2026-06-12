-- Run in Supabase SQL Editor (safe to re-run)
-- Adds membership_type for Standard vs Double ID members

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS membership_type VARCHAR(20) DEFAULT 'standard';

UPDATE users SET membership_type = 'standard' WHERE membership_type IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_membership_type_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_membership_type_check
      CHECK (membership_type IN ('standard', 'double_id'));
  END IF;
END $$;
