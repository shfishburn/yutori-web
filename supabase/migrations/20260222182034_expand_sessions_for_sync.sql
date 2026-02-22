-- ═══════════════════════════════════════════════════════════════════
-- Migration: Expand sessions table for full SessionRecord sync
-- Adds columns to match mobile app's SessionRecord type so the
-- mobile app can upsert complete session data for web display.
-- All new columns are nullable or have defaults to avoid breaking
-- existing rows.
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1) New columns on sessions
-- ─────────────────────────────────────────────
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_type text,
  ADD COLUMN IF NOT EXISTS min_temp_c real,
  ADD COLUMN IF NOT EXISTS avg_humidity_pct real,
  ADD COLUMN IF NOT EXISTS peak_humidity_pct real,
  ADD COLUMN IF NOT EXISTS pause_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paused_duration_ms bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_thermal_burn real,
  ADD COLUMN IF NOT EXISTS total_kcal real,
  ADD COLUMN IF NOT EXISTS calorie_confidence text,
  ADD COLUMN IF NOT EXISTS rlt_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contrast_id uuid,
  ADD COLUMN IF NOT EXISTS split_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transition_ms bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_insight text,
  ADD COLUMN IF NOT EXISTS safety_warning_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS safety_sos_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sensor_ble_id text,
  ADD COLUMN IF NOT EXISTS client_id text;

-- ─────────────────────────────────────────────
-- 2) CHECK constraints
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_session_type'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT chk_session_type
      CHECK (session_type IS NULL OR session_type IN ('sauna', 'cold_plunge'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_avg_humidity_pct'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT chk_avg_humidity_pct
      CHECK (avg_humidity_pct IS NULL OR (avg_humidity_pct >= 0 AND avg_humidity_pct <= 100));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_calorie_confidence'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT chk_calorie_confidence
      CHECK (calorie_confidence IS NULL OR calorie_confidence IN ('low', 'moderate', 'high'));
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 3) Indexes
-- ─────────────────────────────────────────────
-- Unique index on (user_id, client_id) for upsert deduplication.
-- Partial index: only rows with a non-null client_id.
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_client_id
  ON public.sessions(user_id, client_id)
  WHERE client_id IS NOT NULL;

-- Composite index for listing sessions newest-first per user.
CREATE INDEX IF NOT EXISTS idx_sessions_user_started
  ON public.sessions(user_id, started_at DESC);
