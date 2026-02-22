-- Coach analyses cache table for Yutori Coach AI feature
-- Contains derived biometric data (PHI under HIPAA) — strict user isolation required
CREATE TABLE coach_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis JSONB NOT NULL,
  input_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_coach_analyses_user ON coach_analyses(user_id, expires_at DESC);

ALTER TABLE coach_analyses ENABLE ROW LEVEL SECURITY;

-- Users can only read their own cached analyses
CREATE POLICY coach_analyses_user_select ON coach_analyses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only the service role (edge function) can insert cached analyses
CREATE POLICY coach_analyses_service_insert ON coach_analyses
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only the service role (edge function) can delete expired/stale cache entries
CREATE POLICY coach_analyses_service_delete ON coach_analyses
  FOR DELETE
  TO service_role
  USING (true);

-- No UPDATE policy — cache rows are immutable (delete + re-insert)
-- No anon access — anon role has zero permissions on this table
