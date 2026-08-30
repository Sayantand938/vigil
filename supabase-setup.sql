-- ============================================
-- Drop existing table and recreate
-- ============================================
DROP TABLE IF EXISTS timer_entries CASCADE;

CREATE TABLE timer_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ NULL, -- NULL means active session
  elapsed_time INT NOT NULL DEFAULT 0, -- in seconds, calculated by trigger
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE timer_entries ENABLE ROW LEVEL SECURITY;

-- Policies
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
-- Trigger: Auto-calculate elapsed_time on stop
-- ============================================
CREATE OR REPLACE FUNCTION calculate_elapsed_time()
RETURNS TRIGGER AS $$
BEGIN
  -- When end_time changes from NULL to a value (session ends)
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    NEW.elapsed_time = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timer_entries_calculate_elapsed_time
BEFORE UPDATE ON timer_entries
FOR EACH ROW
EXECUTE FUNCTION calculate_elapsed_time();

-- ============================================
-- user_settings (unchanged – daily goal only)
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_goal_minutes INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
END $$;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);