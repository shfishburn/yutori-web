-- ═══════════════════════════════════════════════
-- Migration: Privacy hardening (health/session + telemetry)
-- Goal: Apple/Google privacy-grade defense-in-depth before web exposure.
-- Notes:
-- - RLS is the primary guardrail; this adds explicit SQL privileges (REVOKE/GRANT)
--   to reduce blast radius if a future change accidentally loosens RLS.
-- - Adds short retention tooling for raw Terra webhook payload logs.
-- - Uses conditional blocks so it’s safe to run across environments.
-- ═══════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1) Ensure RLS is enabled on sensitive tables
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.sessions') IS NOT NULL THEN
    ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.sensor_samples') IS NOT NULL THEN
    ALTER TABLE public.sensor_samples ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.health_samples') IS NOT NULL THEN
    ALTER TABLE public.health_samples ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.terra_webhook_log') IS NOT NULL THEN
    ALTER TABLE public.terra_webhook_log ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.coach_analyses') IS NOT NULL THEN
    ALTER TABLE public.coach_analyses ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.telemetry_events') IS NOT NULL THEN
    ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 2) Explicit privileges (REVOKE/GRANT)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  -- Profiles (contains email) — authenticated users only (RLS restricts to own row)
  IF to_regclass('public.profiles') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
    GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;
  END IF;

  -- Sessions (modality + timestamps + device_id; sensitive when combined with biometrics)
  IF to_regclass('public.sessions') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.sessions FROM anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO service_role;
  END IF;

  -- Sensor samples (per-sample time series)
  IF to_regclass('public.sensor_samples') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.sensor_samples FROM anon, authenticated;
    GRANT SELECT, INSERT ON TABLE public.sensor_samples TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sensor_samples TO service_role;

    IF to_regclass('public.sensor_samples_id_seq') IS NOT NULL THEN
      GRANT USAGE, SELECT ON SEQUENCE public.sensor_samples_id_seq TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE public.sensor_samples_id_seq TO service_role;
    END IF;
  END IF;

  -- Health samples (heart rate / HRV) — sensitive health-related data
  IF to_regclass('public.health_samples') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.health_samples FROM anon, authenticated;
    GRANT SELECT, INSERT ON TABLE public.health_samples TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.health_samples TO service_role;

    IF to_regclass('public.health_samples_id_seq') IS NOT NULL THEN
      GRANT USAGE, SELECT ON SEQUENCE public.health_samples_id_seq TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE public.health_samples_id_seq TO service_role;
    END IF;
  END IF;

  -- Coach analyses cache (derived biometrics) — authenticated select only
  IF to_regclass('public.coach_analyses') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.coach_analyses FROM anon, authenticated;
    GRANT SELECT ON TABLE public.coach_analyses TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_analyses TO service_role;
  END IF;

  -- Telemetry (error/safety events) — authenticated insert/select only
  IF to_regclass('public.telemetry_events') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.telemetry_events FROM anon, authenticated;
    GRANT SELECT, INSERT ON TABLE public.telemetry_events TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.telemetry_events TO service_role;

    IF to_regclass('public.telemetry_events_id_seq') IS NOT NULL THEN
      GRANT USAGE, SELECT ON SEQUENCE public.telemetry_events_id_seq TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE public.telemetry_events_id_seq TO service_role;
    END IF;
  END IF;

  -- Terra webhook log (raw payloads) — service_role only
  IF to_regclass('public.terra_webhook_log') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.terra_webhook_log FROM anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.terra_webhook_log TO service_role;

    IF to_regclass('public.terra_webhook_log_id_seq') IS NOT NULL THEN
      GRANT USAGE, SELECT ON SEQUENCE public.terra_webhook_log_id_seq TO service_role;
    END IF;
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 3) Retention tooling for raw Terra webhook payloads
--    (data minimization; keep only short-lived debug window)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.terra_webhook_log') IS NOT NULL THEN
    ALTER TABLE public.terra_webhook_log
      ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days');

    CREATE INDEX IF NOT EXISTS idx_terra_webhook_log_expires
      ON public.terra_webhook_log(expires_at);

    -- Ensure payload is an object (expected Terra JSON shape)
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'chk_terra_webhook_payload_object'
        AND conrelid = 'public.terra_webhook_log'::regclass
    ) THEN
      ALTER TABLE public.terra_webhook_log
        ADD CONSTRAINT chk_terra_webhook_payload_object
        CHECK (jsonb_typeof(payload) = 'object') NOT VALID;
    END IF;
  END IF;
END $$;

-- Service-only purge function (external scheduler / manual ops)
CREATE OR REPLACE FUNCTION public.purge_terra_webhook_log(p_older_than interval default interval '7 days')
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
  v_deleted bigint := 0;
BEGIN
  IF v_role <> 'service_role' THEN
    RAISE EXCEPTION 'service_role required';
  END IF;

  IF to_regclass('public.terra_webhook_log') IS NULL THEN
    RETURN 0;
  END IF;

  DELETE FROM public.terra_webhook_log
  WHERE received_at < (now() - p_older_than)
     OR expires_at < now();

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_terra_webhook_log(interval) FROM public;
GRANT EXECUTE ON FUNCTION public.purge_terra_webhook_log(interval) TO service_role;
