CREATE TABLE timer_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INT NOT NULL, -- in seconds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE timer_entries ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own entries
CREATE POLICY "Users can view their own entries"
  ON timer_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own entries
CREATE POLICY "Users can insert their own entries"
  ON timer_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own entries
CREATE POLICY "Users can update their own entries"
  ON timer_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: users can delete their own entries
CREATE POLICY "Users can delete their own entries"
  ON timer_entries FOR DELETE
  USING (auth.uid() = user_id);