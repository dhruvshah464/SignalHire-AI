/*
-- Supabase Schema for SignalHire AI

CREATE TABLE outreaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  company_name TEXT,
  recruiter_name TEXT,
  recruiter_email TEXT,
  recruiter_url TEXT,
  resume_data JSONB,  -- Parsed resume info
  job_data JSONB,     -- Scraped job info (description, etc)
  messages JSONB,     -- Generated emails/DMs/follow-ups
  last_follow_up_index INT DEFAULT -1,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',  -- draft, sent, replied, closed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE outreaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own outreaches"
  ON outreaches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outreaches"
  ON outreaches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outreaches"
  ON outreaches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outreaches"
  ON outreaches FOR DELETE
  USING (auth.uid() = user_id);
*/
