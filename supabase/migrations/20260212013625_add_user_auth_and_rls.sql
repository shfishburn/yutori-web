-- ═══════════════════════════════════════════════
-- Migration: Add user authentication + proper RLS
-- Idempotent: uses IF NOT EXISTS / DROP IF EXISTS
-- ═══════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. Profiles table (mirrors auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  display_name text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop and recreate to be idempotent
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. Add user_id columns to existing tables
-- ─────────────────────────────────────────────
alter table public.sessions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.sensor_samples
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.health_samples
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Indexes on user_id for efficient RLS filtering
create index if not exists idx_sessions_user on public.sessions(user_id);
create index if not exists idx_sensor_samples_user on public.sensor_samples(user_id);
create index if not exists idx_health_samples_user on public.health_samples(user_id);

-- ─────────────────────────────────────────────
-- 3. Drop old wide-open anon policies
-- ─────────────────────────────────────────────
drop policy if exists "anon_insert_sessions"  on public.sessions;
drop policy if exists "anon_select_sessions"  on public.sessions;
drop policy if exists "anon_update_sessions"  on public.sessions;
drop policy if exists "anon_insert_sensor"    on public.sensor_samples;
drop policy if exists "anon_select_sensor"    on public.sensor_samples;
drop policy if exists "anon_insert_health"    on public.health_samples;
drop policy if exists "anon_select_health"    on public.health_samples;
drop policy if exists "anon_insert_webhook"   on public.terra_webhook_log;
drop policy if exists "anon_select_webhook"   on public.terra_webhook_log;

-- ─────────────────────────────────────────────
-- 4. Profiles RLS — users can read/update own profile
-- ─────────────────────────────────────────────
drop policy if exists "users_read_own_profile"   on public.profiles;
drop policy if exists "users_update_own_profile" on public.profiles;

create policy "users_read_own_profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "users_update_own_profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─────────────────────────────────────────────
-- 5. Sessions RLS — users own their sessions
-- ─────────────────────────────────────────────
drop policy if exists "users_insert_own_sessions" on public.sessions;
drop policy if exists "users_select_own_sessions" on public.sessions;
drop policy if exists "users_update_own_sessions" on public.sessions;
drop policy if exists "users_delete_own_sessions" on public.sessions;

create policy "users_insert_own_sessions"
  on public.sessions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users_select_own_sessions"
  on public.sessions for select
  to authenticated
  using (user_id = auth.uid());

create policy "users_update_own_sessions"
  on public.sessions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users_delete_own_sessions"
  on public.sessions for delete
  to authenticated
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 6. Sensor samples RLS — users own their samples
-- ─────────────────────────────────────────────
drop policy if exists "users_insert_own_sensor" on public.sensor_samples;
drop policy if exists "users_select_own_sensor" on public.sensor_samples;

create policy "users_insert_own_sensor"
  on public.sensor_samples for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users_select_own_sensor"
  on public.sensor_samples for select
  to authenticated
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 7. Health samples RLS — users own + service_role for webhooks
-- ─────────────────────────────────────────────
drop policy if exists "users_insert_own_health" on public.health_samples;
drop policy if exists "users_select_own_health" on public.health_samples;
drop policy if exists "service_insert_health"   on public.health_samples;

create policy "users_insert_own_health"
  on public.health_samples for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users_select_own_health"
  on public.health_samples for select
  to authenticated
  using (user_id = auth.uid());

-- Service role bypasses RLS, but explicit policy for clarity
create policy "service_insert_health"
  on public.health_samples for insert
  to service_role
  with check (true);

-- ─────────────────────────────────────────────
-- 8. Terra webhook log — service_role only
-- ─────────────────────────────────────────────
drop policy if exists "service_insert_webhook" on public.terra_webhook_log;
drop policy if exists "service_select_webhook" on public.terra_webhook_log;

create policy "service_insert_webhook"
  on public.terra_webhook_log for insert
  to service_role
  with check (true);

create policy "service_select_webhook"
  on public.terra_webhook_log for select
  to service_role
  using (true);

-- ─────────────────────────────────────────────
-- 9. updated_at auto-trigger for profiles
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
