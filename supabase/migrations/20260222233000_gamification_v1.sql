-- ═══════════════════════════════════════════════════════════════════
-- Migration: Gamification v1 (private, no social)
-- Award XP + achievements from completed sessions.
-- Idempotent under upsert/backfill via gamification_credits ledger.
-- ═══════════════════════════════════════════════════════════════════

-- 0) Extend sessions with a safe contrast grouping key (text)
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS contrast_group_id text;

-- 1) user_gamification_state (server-maintained)
CREATE TABLE IF NOT EXISTS public.user_gamification_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp bigint NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  sauna_completed_count integer NOT NULL DEFAULT 0,
  plunge_completed_count integer NOT NULL DEFAULT 0,
  contrast_completed_count integer NOT NULL DEFAULT 0,
  current_streak_days integer NOT NULL DEFAULT 0,
  best_streak_days integer NOT NULL DEFAULT 0,
  last_completed_day_utc date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_gamification_state ENABLE ROW LEVEL SECURITY;

-- 2) user_achievements (server-maintained)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_unique
  ON public.user_achievements(user_id, achievement_key);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned
  ON public.user_achievements(user_id, earned_at DESC);

-- 3) gamification_credits (idempotency ledger; server-maintained)
CREATE TABLE IF NOT EXISTS public.gamification_credits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_id text NOT NULL,
  credit_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gamification_credits ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_gamification_credits_dedupe
  ON public.gamification_credits(user_id, source_type, source_id, credit_key);

-- Helpful read indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_ended_at
  ON public.sessions(user_id, ended_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_contrast_group
  ON public.sessions(user_id, contrast_group_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_completed_day_utc
  ON public.sessions(user_id, ((ended_at AT TIME ZONE 'utc')::date))
  WHERE ended_at IS NOT NULL AND duration_ms >= 60000;

-- 4) RLS: read-only for authenticated (server writes via SECURITY DEFINER)
DROP POLICY IF EXISTS user_gamification_state_select_own ON public.user_gamification_state;
CREATE POLICY user_gamification_state_select_own
  ON public.user_gamification_state FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_achievements_select_own ON public.user_achievements;
CREATE POLICY user_achievements_select_own
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS gamification_credits_select_own ON public.gamification_credits;
CREATE POLICY gamification_credits_select_own
  ON public.gamification_credits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5) Awarding trigger function
CREATE OR REPLACE FUNCTION public.award_gamification_on_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted int;
  inserted_contrast int;
  xp_add int;
  contrast_key text;
  has_sauna boolean;
  has_plunge boolean;
  last_day date;
  current_len int;
  best_len int;
  sauna_count int;
  plunge_count int;
  contrast_count int;
BEGIN
  -- Award only for real, completed sessions
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- client_id is the stable identity across upsert/backfill
  IF NEW.client_id IS NULL OR btrim(NEW.client_id) = '' THEN
    RETURN NEW;
  END IF;

  IF NEW.ended_at IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.duration_ms IS NULL OR NEW.duration_ms < 60000 OR NEW.duration_ms > 21600000 THEN
    RETURN NEW;
  END IF;

  IF NEW.started_at IS NULL OR NEW.started_at >= NEW.ended_at THEN
    RETURN NEW;
  END IF;

  IF NEW.session_type IS NULL OR NEW.session_type NOT IN ('sauna', 'cold_plunge') THEN
    RETURN NEW;
  END IF;

  -- Insert idempotency credit for this session; if it already exists, do nothing.
  INSERT INTO public.gamification_credits(user_id, source_type, source_id, credit_key)
  VALUES (NEW.user_id, 'session', NEW.client_id, 'completed_session')
  ON CONFLICT DO NOTHING
  RETURNING 1 INTO inserted;

  IF inserted IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ensure state row exists
  INSERT INTO public.user_gamification_state(user_id)
  VALUES (NEW.user_id)
  ON CONFLICT DO NOTHING;

  xp_add := 10;

  UPDATE public.user_gamification_state
  SET
    xp = xp + xp_add,
    level = 1 + ((xp + xp_add) / 100)::int,
    sauna_completed_count = sauna_completed_count + CASE WHEN NEW.session_type = 'sauna' THEN 1 ELSE 0 END,
    plunge_completed_count = plunge_completed_count + CASE WHEN NEW.session_type = 'cold_plunge' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  -- Contrast completion: only when contrast_group_id is present AND the group has both modalities.
  contrast_key := NULLIF(btrim(COALESCE(NEW.contrast_group_id, '')), '');
  IF contrast_key IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1
      FROM public.sessions s
      WHERE s.user_id = NEW.user_id
        AND s.contrast_group_id = contrast_key
        AND s.client_id IS NOT NULL
        AND s.ended_at IS NOT NULL
        AND s.duration_ms >= 60000
        AND s.duration_ms <= 21600000
        AND s.session_type = 'sauna'
    ) INTO has_sauna;

    SELECT EXISTS(
      SELECT 1
      FROM public.sessions s
      WHERE s.user_id = NEW.user_id
        AND s.contrast_group_id = contrast_key
        AND s.client_id IS NOT NULL
        AND s.ended_at IS NOT NULL
        AND s.duration_ms >= 60000
        AND s.duration_ms <= 21600000
        AND s.session_type = 'cold_plunge'
    ) INTO has_plunge;

    IF has_sauna AND has_plunge THEN
      INSERT INTO public.gamification_credits(user_id, source_type, source_id, credit_key)
      VALUES (NEW.user_id, 'contrast', contrast_key, 'completed_contrast')
      ON CONFLICT DO NOTHING
      RETURNING 1 INTO inserted_contrast;

      IF inserted_contrast IS NOT NULL THEN
        UPDATE public.user_gamification_state
        SET
          xp = xp + 20,
          level = 1 + ((xp + 20) / 100)::int,
          contrast_completed_count = contrast_completed_count + 1,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;

  -- Streak recompute (correct under backfill):
  -- compute distinct completed UTC days, then best run + current run ending at max day.
  WITH days AS (
    SELECT DISTINCT (ended_at AT TIME ZONE 'utc')::date AS d
    FROM public.sessions
    WHERE user_id = NEW.user_id
      AND client_id IS NOT NULL
      AND ended_at IS NOT NULL
      AND duration_ms >= 60000
      AND duration_ms <= 21600000
  ), ordered AS (
    SELECT d, row_number() OVER (ORDER BY d) AS rn
    FROM days
  ), grouped AS (
    SELECT d, (d - rn::int) AS grp
    FROM ordered
  ), runs AS (
    SELECT grp, count(*)::int AS len, max(d) AS run_last_day
    FROM grouped
    GROUP BY grp
  ), stats AS (
    SELECT
      (SELECT max(d) FROM days) AS last_completed_day,
      (SELECT coalesce(max(len), 0) FROM runs) AS best_streak,
      (SELECT coalesce(len, 0) FROM runs ORDER BY run_last_day DESC LIMIT 1) AS current_streak
  )
  SELECT last_completed_day, current_streak, best_streak
  INTO last_day, current_len, best_len
  FROM stats;

  UPDATE public.user_gamification_state
  SET
    last_completed_day_utc = last_day,
    current_streak_days = current_len,
    best_streak_days = best_len,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  -- Achievement thresholds (count-based + streak)
  SELECT
    sauna_completed_count,
    plunge_completed_count,
    contrast_completed_count
  INTO sauna_count, plunge_count, contrast_count
  FROM public.user_gamification_state
  WHERE user_id = NEW.user_id;

  IF sauna_count >= 1 THEN
    INSERT INTO public.user_achievements(user_id, achievement_key)
    VALUES (NEW.user_id, 'sauna_first')
    ON CONFLICT DO NOTHING;
  END IF;

  IF plunge_count >= 1 THEN
    INSERT INTO public.user_achievements(user_id, achievement_key)
    VALUES (NEW.user_id, 'plunge_first')
    ON CONFLICT DO NOTHING;
  END IF;

  IF contrast_count >= 1 THEN
    INSERT INTO public.user_achievements(user_id, achievement_key)
    VALUES (NEW.user_id, 'contrast_first')
    ON CONFLICT DO NOTHING;
  END IF;

  IF sauna_count >= 10 THEN
    INSERT INTO public.user_achievements(user_id, achievement_key)
    VALUES (NEW.user_id, 'sauna_10')
    ON CONFLICT DO NOTHING;
  END IF;

  IF plunge_count >= 10 THEN
    INSERT INTO public.user_achievements(user_id, achievement_key)
    VALUES (NEW.user_id, 'plunge_10')
    ON CONFLICT DO NOTHING;
  END IF;

  IF contrast_count >= 5 THEN
    INSERT INTO public.user_achievements(user_id, achievement_key)
    VALUES (NEW.user_id, 'contrast_5')
    ON CONFLICT DO NOTHING;
  END IF;

  IF current_len >= 7 THEN
    INSERT INTO public.user_achievements(user_id, achievement_key)
    VALUES (NEW.user_id, 'streak_7')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 6) Attach trigger (idempotent)
DROP TRIGGER IF EXISTS trg_award_gamification_on_session ON public.sessions;
CREATE TRIGGER trg_award_gamification_on_session
  AFTER INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  WHEN (NEW.ended_at IS NOT NULL AND NEW.client_id IS NOT NULL
        AND NEW.duration_ms IS NOT NULL AND NEW.duration_ms >= 60000)
  EXECUTE FUNCTION public.award_gamification_on_session();
