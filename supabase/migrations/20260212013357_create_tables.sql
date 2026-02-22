-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- Sessions table
-- ─────────────────────────────────────────────
create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  device_id     text,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  duration_ms   bigint,
  peak_temp_c   real,
  hrv_trend     real,
  created_at    timestamptz not null default now()
);

alter table public.sessions enable row level security;

-- ─────────────────────────────────────────────
-- Sensor samples (RuuviTag data)
-- ─────────────────────────────────────────────
create table public.sensor_samples (
  id            bigint generated always as identity primary key,
  session_id    uuid references public.sessions(id) on delete cascade,
  temperature   real not null,
  humidity      real not null,
  pressure      real not null,
  battery       real not null,
  recorded_at   timestamptz not null default now()
);

alter table public.sensor_samples enable row level security;

create index idx_sensor_samples_session on public.sensor_samples(session_id);

-- ─────────────────────────────────────────────
-- Health samples (HR / HRV from Terra or Apple Health)
-- ─────────────────────────────────────────────
create table public.health_samples (
  id            bigint generated always as identity primary key,
  session_id    uuid references public.sessions(id) on delete cascade,
  heart_rate    real not null,
  hrv           real,
  source        text not null default 'terra',
  recorded_at   timestamptz not null default now()
);

alter table public.health_samples enable row level security;

create index idx_health_samples_session on public.health_samples(session_id);

-- ─────────────────────────────────────────────
-- Terra webhook log (raw payloads for debugging)
-- ─────────────────────────────────────────────
create table public.terra_webhook_log (
  id            bigint generated always as identity primary key,
  event_type    text,
  payload       jsonb not null,
  received_at   timestamptz not null default now()
);

alter table public.terra_webhook_log enable row level security;

-- ─────────────────────────────────────────────
-- RLS policies — open for now (anon insert/select)
-- Tighten once auth is added
-- ─────────────────────────────────────────────
create policy "anon_insert_sessions"  on public.sessions  for insert to anon with check (true);
create policy "anon_select_sessions"  on public.sessions  for select to anon using (true);
create policy "anon_update_sessions"  on public.sessions  for update to anon using (true);

create policy "anon_insert_sensor"    on public.sensor_samples  for insert to anon with check (true);
create policy "anon_select_sensor"    on public.sensor_samples  for select to anon using (true);

create policy "anon_insert_health"    on public.health_samples  for insert to anon with check (true);
create policy "anon_select_health"    on public.health_samples  for select to anon using (true);

create policy "anon_insert_webhook"   on public.terra_webhook_log  for insert to anon with check (true);
create policy "anon_select_webhook"   on public.terra_webhook_log  for select to anon using (true);
