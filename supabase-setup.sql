-- ============================================
-- 1. timer_entries (unchanged)
-- ============================================
CREATE TABLE IF NOT EXISTS timer_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INT NOT NULL, -- in seconds
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE timer_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates (safe)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own entries" ON timer_entries;
  DROP POLICY IF EXISTS "Users can insert their own entries" ON timer_entries;
  DROP POLICY IF EXISTS "Users can update their own entries" ON timer_entries;
  DROP POLICY IF EXISTS "Users can delete their own entries" ON timer_entries;
END $$;

-- Create fresh policies
CREATE POLICY "Users can view their own entries"
  ON timer_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
  ON timer_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON timer_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON timer_entries FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- 2. user_settings (only daily goal)
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_goal_minutes INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Remove weekly column if it exists (migration from previous version)
ALTER TABLE user_settings DROP COLUMN IF EXISTS weekly_goal_minutes;

-- Ensure daily_goal_minutes exists (in case table was created without it)
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS daily_goal_minutes INT NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
END $$;

-- Create fresh policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);