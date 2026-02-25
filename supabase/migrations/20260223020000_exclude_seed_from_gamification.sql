-- ═══════════════════════════════════════════════════════════════════
-- Fix: Exclude seed/synthetic sessions from gamification
--
-- The seed-test-data.sql script inserts sessions with client_id
-- like 'seed-%'. These fire the gamification trigger and inflate
-- XP, counts, streaks, and achievements with synthetic data.
--
-- This migration:
--   1) Updates award_gamification_on_session to skip seed client_ids
--   2) Excludes seed sessions from streak + contrast count queries
--   3) Rebuilds gamification state from real sessions only
-- ═══════════════════════════════════════════════════════════════════

-- 1) Replace the trigger function with seed filtering
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

  -- Skip synthetic/seed sessions — they exist for web display only
  IF NEW.client_id LIKE 'seed-%' THEN
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
        AND s.client_id NOT LIKE 'seed-%'
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
        AND s.client_id NOT LIKE 'seed-%'
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
  -- Excludes seed sessions so synthetic data doesn't inflate streaks.
  WITH days AS (
    SELECT DISTINCT (ended_at AT TIME ZONE 'utc')::date AS d
    FROM public.sessions
    WHERE user_id = NEW.user_id
      AND client_id IS NOT NULL
      AND client_id NOT LIKE 'seed-%'
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

-- 2) Clean up gamification state that was inflated by seed sessions.
--    Delete seed-sourced credits, then rebuild counts from remaining credits.
DO $$
DECLARE
  v_uid uuid;
  v_sauna int;
  v_plunge int;
  v_contrast int;
  v_total_xp bigint;
  v_last_day date;
  v_current_len int;
  v_best_len int;
BEGIN
  -- Delete gamification credits that came from seed sessions
  DELETE FROM public.gamification_credits
  WHERE source_id LIKE 'seed-%';

  -- Rebuild state for each user that has gamification_credits
  FOR v_uid IN
    SELECT DISTINCT user_id FROM public.user_gamification_state
  LOOP
    -- Recount from credits ledger
    SELECT coalesce(count(*), 0)
    INTO v_sauna
    FROM public.gamification_credits
    WHERE user_id = v_uid AND credit_key = 'completed_session'
      AND source_id IN (
        SELECT client_id FROM public.sessions
        WHERE user_id = v_uid AND session_type = 'sauna'
          AND client_id NOT LIKE 'seed-%'
      );

    SELECT coalesce(count(*), 0)
    INTO v_plunge
    FROM public.gamification_credits
    WHERE user_id = v_uid AND credit_key = 'completed_session'
      AND source_id IN (
        SELECT client_id FROM public.sessions
        WHERE user_id = v_uid AND session_type = 'cold_plunge'
          AND client_id NOT LIKE 'seed-%'
      );

    SELECT coalesce(count(*), 0)
    INTO v_contrast
    FROM public.gamification_credits
    WHERE user_id = v_uid AND credit_key = 'completed_contrast';

    -- XP = 10 per session + 20 per contrast
    v_total_xp := (v_sauna + v_plunge) * 10 + v_contrast * 20;

    -- Recompute streak from real sessions only
    WITH days AS (
      SELECT DISTINCT (ended_at AT TIME ZONE 'utc')::date AS d
      FROM public.sessions
      WHERE user_id = v_uid
        AND client_id IS NOT NULL
        AND client_id NOT LIKE 'seed-%'
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
    INTO v_last_day, v_current_len, v_best_len
    FROM stats;

    UPDATE public.user_gamification_state
    SET
      xp = v_total_xp,
      level = 1 + (v_total_xp / 100)::int,
      sauna_completed_count = v_sauna,
      plunge_completed_count = v_plunge,
      contrast_completed_count = v_contrast,
      current_streak_days = coalesce(v_current_len, 0),
      best_streak_days = coalesce(v_best_len, 0),
      last_completed_day_utc = v_last_day,
      updated_at = now()
    WHERE user_id = v_uid;

    -- Remove achievements that no longer meet thresholds
    IF v_sauna < 1 THEN
      DELETE FROM public.user_achievements WHERE user_id = v_uid AND achievement_key = 'sauna_first';
    END IF;
    IF v_plunge < 1 THEN
      DELETE FROM public.user_achievements WHERE user_id = v_uid AND achievement_key = 'plunge_first';
    END IF;
    IF v_contrast < 1 THEN
      DELETE FROM public.user_achievements WHERE user_id = v_uid AND achievement_key = 'contrast_first';
    END IF;
    IF v_sauna < 10 THEN
      DELETE FROM public.user_achievements WHERE user_id = v_uid AND achievement_key = 'sauna_10';
    END IF;
    IF v_plunge < 10 THEN
      DELETE FROM public.user_achievements WHERE user_id = v_uid AND achievement_key = 'plunge_10';
    END IF;
    IF v_contrast < 5 THEN
      DELETE FROM public.user_achievements WHERE user_id = v_uid AND achievement_key = 'contrast_5';
    END IF;
    IF coalesce(v_current_len, 0) < 7 AND coalesce(v_best_len, 0) < 7 THEN
      DELETE FROM public.user_achievements WHERE user_id = v_uid AND achievement_key = 'streak_7';
    END IF;
  END LOOP;
END $$;
