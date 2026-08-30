-- ============================================
-- FRESH START – Drops existing tables if any
-- ============================================
DROP TABLE IF EXISTS timer_entries CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- ============================================
-- 1. timer_entries (persistent timer)
-- ============================================
CREATE TABLE timer_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ NULL,          -- NULL = not saved yet
  stopped_at TIMESTAMPTZ NULL,        -- when user clicked Stop (pending save)
  elapsed_time INT NOT NULL DEFAULT 0, -- set by app on Save
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE timer_entries ENABLE ROW LEVEL SECURITY;

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

-- No trigger – elapsed_time is set by the application.

-- ============================================
-- 2. user_settings (daily goal only)
-- ============================================
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_goal_minutes INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);



  -- Lifetime stats for a user
CREATE OR REPLACE FUNCTION get_lifetime_stats(user_id UUID)
RETURNS TABLE(
  total_time BIGINT,
  total_sessions BIGINT,
  avg_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(elapsed_time), 0)::BIGINT AS total_time,
    COUNT(*)::BIGINT AS total_sessions,
    COALESCE(AVG(elapsed_time), 0)::NUMERIC(10,2) AS avg_duration
  FROM timer_entries
  WHERE timer_entries.user_id = get_lifetime_stats.user_id;
END;
$$ LANGUAGE plpgsql STABLE;