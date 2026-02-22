# Commerce Identity Migration Runbook

## Scope
This runbook covers rollout of `20260221134000_add_commerce_identity_linking.sql`, which links Shopify customers to Supabase users with privacy-by-design controls.

## Privacy Controls Implemented
- Raw email is **not** stored in commerce identity tables.
- Email matching uses deterministic SHA-256 hash (`email_hash`).
- Audit table stores hashed email only (`attempted_email_hash`).
- Least privilege: `anon` has no access, `authenticated` can only read own commerce row.
- Service-only link operations are enforced via `require_service_role()`.
- Conflict conditions are explicit and never silently overwritten.
- Audit retention helper is provided (`purge_commerce_link_audit`).

## Preflight Checklist
1. Confirm migration is not yet applied:
```sql
select version from supabase_migrations.schema_migrations
where version = '20260221134000';
```
2. Confirm profiles table has expected email quality:
```sql
select
  count(*) filter (where email is null or trim(email) = '') as missing_email,
  count(*) as total_profiles
from public.profiles;
```
3. Confirm no duplicate normalized emails:
```sql
select lower(trim(email)) as normalized_email, count(*)
from public.profiles
where email is not null and trim(email) <> ''
group by 1
having count(*) > 1;
```

## Deployment Steps
1. Apply migrations through your normal Supabase migration pipeline.
2. Verify tables, policies, and functions exist:
```sql
select tablename from pg_tables
where schemaname='public'
and tablename in ('commerce_customers', 'commerce_link_audit');
```
```sql
select proname from pg_proc
where pronamespace = 'public'::regnamespace
and proname in (
  'normalize_email',
  'email_sha256_hex',
  'require_service_role',
  'ensure_commerce_customer_row',
  'link_shopify_customer_by_email',
  'purge_commerce_link_audit'
);
```
3. Validate backfill coverage:
```sql
select
  (select count(*) from public.profiles where email is not null and trim(email) <> '') as profile_rows,
  (select count(*) from public.commerce_customers) as commerce_rows;
```

## Post-Deploy Validation
1. Verify authenticated users can only read their own row.
2. Verify service webhook path can call:
```sql
select public.link_shopify_customer_by_email(
  'user@example.com',
  'gid://shopify/Customer/1234567890',
  'webhook',
  'test-ref-001'
);
```
3. Verify conflicts are explicit (no overwrite):
- Link the same user with a different `shopify_customer_id` and confirm exception + audit row.

## Retention
Set a scheduled service task to execute:
```sql
select public.purge_commerce_link_audit(interval '180 days');
```

## Rollback Strategy
1. Stop webhook link writes.
2. Keep tables in place (non-destructive rollback).
3. Revert application usage to pre-linking behavior.
4. If needed, disable function execution grants for service role until issue is fixed.
