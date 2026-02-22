-- ============================================================
-- user_profiles — persisted profile data (survives app reinstall)
-- Fields mirror the mobile ProfileState so the app can restore
-- a user's biometric/equipment preferences after sign-in.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Biometric
  gender          text        CHECK (gender IN ('male','female','other')),
  age             smallint    CHECK (age > 0 AND age < 200),
  weight_kg       real        CHECK (weight_kg > 0 AND weight_kg < 700),
  height_cm       real        CHECK (height_cm > 0 AND height_cm < 300),
  resting_hr      smallint    CHECK (resting_hr > 20 AND resting_hr < 250),
  body_fat_pct    real        CHECK (body_fat_pct >= 0 AND body_fat_pct <= 100),

  -- Equipment preferences
  sauna_type      text        CHECK (sauna_type IN ('finnish','infrared','steam')),
  rlt_enabled     boolean     NOT NULL DEFAULT true,
  rlt_panel       jsonb,

  -- Timestamps
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index is the PK itself (user_id) — no additional index needed.

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own profile row.
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── Grant access via the anon/authenticated roles ─────────────
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
