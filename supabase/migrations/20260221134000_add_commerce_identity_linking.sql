-- ═══════════════════════════════════════════════
-- Migration: Enterprise commerce identity linking
-- Purpose: shared auth/account mapping across mobile + web + Shopify
-- Privacy: data minimization, least privilege, strict audit controls
-- Idempotent: IF NOT EXISTS / DROP IF EXISTS / CREATE OR REPLACE
-- ═══════════════════════════════════════════════

-- We only need deterministic hashing for email matching.
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────
-- 1. Privacy-safe helper functions
-- ─────────────────────────────────────────────
create or replace function public.normalize_email(p_email text)
returns text
language sql
immutable
strict
as $$
  select lower(trim(p_email));
$$;

create or replace function public.email_sha256_hex(p_email text)
returns text
language sql
immutable
strict
as $$
  select encode(
    extensions.digest(
      convert_to(public.normalize_email(p_email), 'utf8'),
      'sha256'::text
    ),
    'hex'
  );
$$;

create or replace function public.require_service_role()
returns void
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  v_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if v_role <> 'service_role' then
    raise exception 'service_role required';
  end if;
end;
$$;

revoke all on function public.normalize_email(text) from public;
grant execute on function public.normalize_email(text) to authenticated, service_role;

revoke all on function public.email_sha256_hex(text) from public;
grant execute on function public.email_sha256_hex(text) to authenticated, service_role;

revoke all on function public.require_service_role() from public;
grant execute on function public.require_service_role() to service_role;

-- ─────────────────────────────────────────────
-- 2. Core identity link table (no raw email storage)
-- ─────────────────────────────────────────────
create table if not exists public.commerce_customers (
  id                     bigint generated always as identity primary key,
  user_id                uuid not null references auth.users(id) on delete cascade,
  email_hash             text not null check (length(email_hash) = 64),
  email_domain           text not null default '',
  shopify_customer_id    text,
  shopify_customer_state text not null default 'unlinked'
    check (shopify_customer_state in ('unlinked', 'linked', 'conflict')),
  link_source            text not null default 'backfill'
    check (link_source in ('backfill', 'webhook', 'manual', 'account_login', 'admin')),
  legal_basis            text not null default 'contract'
    check (legal_basis in ('contract', 'consent', 'legitimate_interest')),
  linked_at              timestamptz,
  conflict_reason        text,
  metadata               jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id),
  check (
    shopify_customer_id is null
    or shopify_customer_id like 'gid://shopify/Customer/%'
  )
);

create unique index if not exists idx_commerce_customers_shopify_customer
  on public.commerce_customers(shopify_customer_id)
  where shopify_customer_id is not null;

create index if not exists idx_commerce_customers_email_hash
  on public.commerce_customers(email_hash);

create index if not exists idx_commerce_customers_state
  on public.commerce_customers(shopify_customer_state);

alter table public.commerce_customers enable row level security;

-- ─────────────────────────────────────────────
-- 3. Audit trail (hashed identifiers only)
-- ─────────────────────────────────────────────
create table if not exists public.commerce_link_audit (
  id                  bigint generated always as identity primary key,
  attempted_email_hash text,
  resolved_user_id    uuid references auth.users(id) on delete set null,
  shopify_customer_id text,
  action              text not null
    check (action in ('linked', 'updated', 'skipped', 'conflict', 'error')),
  reason              text,
  source              text not null default 'webhook',
  external_ref        text,
  created_at          timestamptz not null default now(),
  check (attempted_email_hash is null or length(attempted_email_hash) = 64)
);

create index if not exists idx_commerce_link_audit_user_id
  on public.commerce_link_audit(resolved_user_id, created_at desc);

create index if not exists idx_commerce_link_audit_email_hash
  on public.commerce_link_audit(attempted_email_hash, created_at desc);

create index if not exists idx_commerce_link_audit_action
  on public.commerce_link_audit(action, created_at desc);

alter table public.commerce_link_audit enable row level security;

-- Keep updated_at accurate on mutable tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists commerce_customers_updated_at on public.commerce_customers;
create trigger commerce_customers_updated_at
  before update on public.commerce_customers
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- 4. Explicit grants + RLS (deny by default)
-- ─────────────────────────────────────────────
revoke all on table public.commerce_customers from anon, authenticated;
revoke all on table public.commerce_link_audit from anon, authenticated;

grant select on table public.commerce_customers to authenticated;
grant select, insert, update, delete on table public.commerce_customers to service_role;
grant select, insert on table public.commerce_link_audit to service_role;

drop policy if exists "users_select_own_commerce_customer" on public.commerce_customers;
drop policy if exists "service_all_commerce_customers" on public.commerce_customers;
drop policy if exists "service_insert_commerce_link_audit" on public.commerce_link_audit;
drop policy if exists "service_select_commerce_link_audit" on public.commerce_link_audit;

create policy "users_select_own_commerce_customer"
  on public.commerce_customers for select
  to authenticated
  using (user_id = auth.uid());

create policy "service_all_commerce_customers"
  on public.commerce_customers for all
  to service_role
  using (true)
  with check (true);

create policy "service_insert_commerce_link_audit"
  on public.commerce_link_audit for insert
  to service_role
  with check (true);

create policy "service_select_commerce_link_audit"
  on public.commerce_link_audit for select
  to service_role
  using (true);

-- ─────────────────────────────────────────────
-- 5. Ensure current authenticated user has a row
-- ─────────────────────────────────────────────
create or replace function public.ensure_commerce_customer_row()
returns public.commerce_customers
language plpgsql
security definer set search_path = public, auth, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_normalized_email text;
  v_row public.commerce_customers;
begin
  if v_uid is null then
    raise exception 'ensure_commerce_customer_row requires authenticated user';
  end if;

  select coalesce(
    (
      select nullif(trim(p.email), '')
      from public.profiles p
      where p.id = v_uid
      limit 1
    ),
    nullif(trim(auth.jwt() ->> 'email'), ''),
    v_uid::text || '@unknown.local'
  )
  into v_email;

  v_normalized_email := public.normalize_email(v_email);

  insert into public.commerce_customers (
    user_id,
    email_hash,
    email_domain,
    shopify_customer_state,
    link_source,
    legal_basis
  )
  values (
    v_uid,
    public.email_sha256_hex(v_normalized_email),
    coalesce(split_part(v_normalized_email, '@', 2), ''),
    'unlinked',
    'backfill',
    'contract'
  )
  on conflict (user_id) do update
    set email_hash = excluded.email_hash,
        email_domain = excluded.email_domain,
        updated_at = now();

  select *
    into v_row
  from public.commerce_customers
  where user_id = v_uid;

  return v_row;
end;
$$;

revoke all on function public.ensure_commerce_customer_row() from public;
grant execute on function public.ensure_commerce_customer_row() to authenticated, service_role;

-- ─────────────────────────────────────────────
-- 6. Service-only link function (strict conflict handling)
-- ─────────────────────────────────────────────
create or replace function public.link_shopify_customer_by_email(
  p_email text,
  p_shopify_customer_id text,
  p_source text default 'webhook',
  p_external_ref text default null
)
returns public.commerce_customers
language plpgsql
security definer set search_path = public, auth, extensions
as $$
declare
  v_email text := coalesce(p_email, '');
  v_normalized_email text;
  v_email_hash text;
  v_shopify_customer_id text := nullif(trim(coalesce(p_shopify_customer_id, '')), '');
  v_source text := coalesce(nullif(trim(p_source), ''), 'webhook');
  v_user_id uuid;
  v_user_count integer;
  v_existing_user uuid;
  v_row public.commerce_customers;
begin
  perform public.require_service_role();

  v_normalized_email := public.normalize_email(v_email);
  if v_normalized_email = '' then
    raise exception 'p_email is required';
  end if;

  if v_shopify_customer_id is null then
    raise exception 'p_shopify_customer_id is required';
  end if;

  v_email_hash := public.email_sha256_hex(v_normalized_email);

  select count(*), min(id)
    into v_user_count, v_user_id
  from public.profiles
  where lower(email) = v_normalized_email;

  if v_user_count = 0 then
    insert into public.commerce_link_audit (
      attempted_email_hash,
      shopify_customer_id,
      action,
      reason,
      source,
      external_ref
    )
    values (
      v_email_hash,
      v_shopify_customer_id,
      'skipped',
      'no_profile_for_email',
      v_source,
      p_external_ref
    );
    return null;
  end if;

  if v_user_count > 1 then
    insert into public.commerce_link_audit (
      attempted_email_hash,
      shopify_customer_id,
      action,
      reason,
      source,
      external_ref
    )
    values (
      v_email_hash,
      v_shopify_customer_id,
      'conflict',
      'multiple_profiles_for_email',
      v_source,
      p_external_ref
    );
    raise exception 'multiple profiles found for email hash %', v_email_hash;
  end if;

  select user_id
    into v_existing_user
  from public.commerce_customers
  where shopify_customer_id = v_shopify_customer_id
    and user_id <> v_user_id
  limit 1;

  if v_existing_user is not null then
    insert into public.commerce_link_audit (
      attempted_email_hash,
      resolved_user_id,
      shopify_customer_id,
      action,
      reason,
      source,
      external_ref
    )
    values (
      v_email_hash,
      v_user_id,
      v_shopify_customer_id,
      'conflict',
      'shopify_customer_already_linked_to_other_user',
      v_source,
      p_external_ref
    );
    raise exception 'shopify customer id already linked to another user';
  end if;

  insert into public.commerce_customers (
    user_id,
    email_hash,
    email_domain,
    shopify_customer_state,
    link_source,
    legal_basis
  )
  values (
    v_user_id,
    v_email_hash,
    coalesce(split_part(v_normalized_email, '@', 2), ''),
    'unlinked',
    'backfill',
    'contract'
  )
  on conflict (user_id) do nothing;

  select *
    into v_row
  from public.commerce_customers
  where user_id = v_user_id
  for update;

  if v_row.shopify_customer_id is null then
    update public.commerce_customers
      set shopify_customer_id = v_shopify_customer_id,
          shopify_customer_state = 'linked',
          link_source = v_source,
          linked_at = now(),
          conflict_reason = null,
          updated_at = now()
    where user_id = v_user_id
    returning *
    into v_row;

    insert into public.commerce_link_audit (
      attempted_email_hash,
      resolved_user_id,
      shopify_customer_id,
      action,
      reason,
      source,
      external_ref
    )
    values (
      v_email_hash,
      v_user_id,
      v_shopify_customer_id,
      'linked',
      null,
      v_source,
      p_external_ref
    );

    return v_row;
  end if;

  if v_row.shopify_customer_id = v_shopify_customer_id then
    update public.commerce_customers
      set shopify_customer_state = 'linked',
          link_source = v_source,
          linked_at = coalesce(linked_at, now()),
          conflict_reason = null,
          updated_at = now()
    where user_id = v_user_id
    returning *
    into v_row;

    insert into public.commerce_link_audit (
      attempted_email_hash,
      resolved_user_id,
      shopify_customer_id,
      action,
      reason,
      source,
      external_ref
    )
    values (
      v_email_hash,
      v_user_id,
      v_shopify_customer_id,
      'updated',
      'already_linked',
      v_source,
      p_external_ref
    );

    return v_row;
  end if;

  update public.commerce_customers
    set shopify_customer_state = 'conflict',
        conflict_reason = format(
          'existing shopify_customer_id %s differs from incoming %s',
          v_row.shopify_customer_id,
          v_shopify_customer_id
        ),
        link_source = v_source,
        updated_at = now()
  where user_id = v_user_id
  returning *
  into v_row;

  insert into public.commerce_link_audit (
    attempted_email_hash,
    resolved_user_id,
    shopify_customer_id,
    action,
    reason,
    source,
    external_ref
  )
  values (
    v_email_hash,
    v_user_id,
    v_shopify_customer_id,
    'conflict',
    'existing_user_linked_to_different_shopify_customer',
    v_source,
    p_external_ref
  );

  raise exception 'existing user already linked to a different shopify customer id';
end;
$$;

revoke all on function public.link_shopify_customer_by_email(text, text, text, text) from public;
grant execute on function public.link_shopify_customer_by_email(text, text, text, text) to service_role;

-- ─────────────────────────────────────────────
-- 7. Retention helper (service role only)
-- ─────────────────────────────────────────────
create or replace function public.purge_commerce_link_audit(
  p_older_than interval default interval '180 days'
)
returns bigint
language plpgsql
security definer set search_path = public, auth, extensions
as $$
declare
  v_deleted bigint;
begin
  perform public.require_service_role();

  delete from public.commerce_link_audit
  where created_at < now() - p_older_than;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_commerce_link_audit(interval) from public;
grant execute on function public.purge_commerce_link_audit(interval) to service_role;

-- ─────────────────────────────────────────────
-- 8. Backfill existing users (idempotent)
-- ─────────────────────────────────────────────
insert into public.commerce_customers (
  user_id,
  email_hash,
  email_domain,
  shopify_customer_state,
  link_source,
  legal_basis
)
select
  p.id,
  public.email_sha256_hex(lower(trim(p.email))),
  coalesce(split_part(lower(trim(p.email)), '@', 2), ''),
  'unlinked',
  'backfill',
  'contract'
from public.profiles p
where p.email is not null
  and length(trim(p.email)) > 0
on conflict (user_id) do update
  set email_hash = excluded.email_hash,
      email_domain = excluded.email_domain,
      updated_at = now();
