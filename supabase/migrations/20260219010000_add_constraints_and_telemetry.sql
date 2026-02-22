-- ─────────────────────────────────────────────
-- CHECK constraints on health_samples
-- ─────────────────────────────────────────────
ALTER TABLE public.health_samples
  ADD CONSTRAINT chk_heart_rate CHECK (heart_rate >= 20 AND heart_rate <= 250);

ALTER TABLE public.health_samples
  ADD CONSTRAINT chk_hrv CHECK (hrv IS NULL OR (hrv >= 0 AND hrv <= 500));

-- ─────────────────────────────────────────────
-- CHECK constraints on sensor_samples
-- ─────────────────────────────────────────────
ALTER TABLE public.sensor_samples
  ADD CONSTRAINT chk_temperature CHECK (temperature >= -40 AND temperature <= 150);

ALTER TABLE public.sensor_samples
  ADD CONSTRAINT chk_humidity CHECK (humidity >= 0 AND humidity <= 100);

ALTER TABLE public.sensor_samples
  ADD CONSTRAINT chk_pressure CHECK (pressure >= 30000 AND pressure <= 115000);

ALTER TABLE public.sensor_samples
  ADD CONSTRAINT chk_battery CHECK (battery >= 0 AND battery <= 100);

-- ─────────────────────────────────────────────
-- Telemetry events table (safety event logging)
-- ─────────────────────────────────────────────
CREATE TABLE public.telemetry_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     uuid NOT NULL DEFAULT auth.uid(),
  event_name  text NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(payload) = 'object'),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own telemetry events
CREATE POLICY "users_insert_own_telemetry"
  ON public.telemetry_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can read their own telemetry events
CREATE POLICY "users_select_own_telemetry"
  ON public.telemetry_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_telemetry_user_created
  ON public.telemetry_events (user_id, created_at DESC);

-- ─────────────────────────────────────────────
-- Explicit grants (defense-in-depth)
-- RLS remains the primary enforcement layer.
-- ─────────────────────────────────────────────
REVOKE ALL ON TABLE public.telemetry_events FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.telemetry_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.telemetry_events TO service_role;

-- Identity sequence privileges (required for INSERT with identity PK)
GRANT USAGE, SELECT ON SEQUENCE public.telemetry_events_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.telemetry_events_id_seq TO service_role;
