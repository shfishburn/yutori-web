-- ============================================================
-- Add unit_preference to user_profiles
-- Valid values: 'imperial' (default) or 'metric'
-- ============================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS unit_preference text
    NOT NULL DEFAULT 'imperial'
    CHECK (unit_preference IN ('imperial', 'metric'));
