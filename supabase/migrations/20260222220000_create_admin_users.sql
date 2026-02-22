-- Create admin_users table
create table public.admin_users (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  role       text        not null default 'admin',
  created_at timestamptz not null default now()
);

-- No public access by default
alter table public.admin_users enable row level security;

-- Authenticated users can only read their own row
create policy "admin_users: self read"
  on public.admin_users
  for select
  to authenticated
  using (auth.email() = email);

-- Only service_role can insert/update/delete (no client-side writes)
-- (no additional policies needed — RLS blocks all other operations)

-- Seed admin users
insert into public.admin_users (email, role) values
  ('stephen@yutorilabs.com', 'admin'),
  ('jacob@yutorilabs.com',   'admin');
