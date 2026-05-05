-- =========================================================
-- X FITNESS Walk-in System - Database Schema
-- Run this in Supabase SQL Editor
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================
-- Customers table
-- =========================================================
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  ic text unique not null,
  name text not null,
  phone text not null,
  emergency_contact_name text,
  emergency_contact_phone text,
  status text not null default 'active' check (status in ('active', 'banned')),
  warning_count integer not null default 0 check (warning_count >= 0 and warning_count <= 3),
  ban_reason text,
  banned_at timestamptz,
  banned_by uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_ic_idx on customers(ic);
create index if not exists customers_phone_idx on customers(phone);
create index if not exists customers_name_idx on customers(name);
create index if not exists customers_status_idx on customers(status);

-- =========================================================
-- Visit logs (every check-in attempt, including banned)
-- =========================================================
create table if not exists visits (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  ic text not null,
  status text not null check (status in ('approved', 'denied_banned')),
  visited_at timestamptz not null default now()
);

create index if not exists visits_customer_id_idx on visits(customer_id);
create index if not exists visits_visited_at_idx on visits(visited_at desc);
create index if not exists visits_ic_idx on visits(ic);

-- =========================================================
-- Warnings log (audit trail for warnings)
-- =========================================================
create table if not exists warnings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  reason text not null,
  added_by uuid not null,
  added_by_name text,
  created_at timestamptz not null default now()
);

create index if not exists warnings_customer_id_idx on warnings(customer_id);

-- =========================================================
-- Customer notes (staff/admin notes attached to customer)
-- =========================================================
create table if not exists customer_notes (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  note text not null,
  added_by uuid not null,
  added_by_name text,
  created_at timestamptz not null default now()
);

create index if not exists customer_notes_customer_id_idx on customer_notes(customer_id);

-- =========================================================
-- App users (staff & admin)
-- Linked to Supabase auth.users
-- =========================================================
create table if not exists app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- Audit log (track admin actions)
-- =========================================================
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  user_name text,
  action text not null,
  customer_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on audit_log(created_at desc);
create index if not exists audit_log_customer_id_idx on audit_log(customer_id);

-- =========================================================
-- Auto-update updated_at trigger
-- =========================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_customers_updated_at on customers;
create trigger update_customers_updated_at
before update on customers
for each row execute function update_updated_at_column();

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================
alter table customers enable row level security;
alter table visits enable row level security;
alter table warnings enable row level security;
alter table customer_notes enable row level security;
alter table app_users enable row level security;
alter table audit_log enable row level security;

-- Public can INSERT new customers (for self-registration via QR)
-- Public can SELECT customer status by IC (for check-in)
-- Public can INSERT visits

create policy "Public can register"
on customers for insert
to anon
with check (true);

create policy "Public can read customer for check-in"
on customers for select
to anon
using (true);

create policy "Public can log visits"
on visits for insert
to anon
with check (true);

-- Authenticated users can do everything
create policy "Authenticated full access customers"
on customers for all
to authenticated
using (true) with check (true);

create policy "Authenticated full access visits"
on visits for all
to authenticated
using (true) with check (true);

create policy "Authenticated full access warnings"
on warnings for all
to authenticated
using (true) with check (true);

create policy "Authenticated full access notes"
on customer_notes for all
to authenticated
using (true) with check (true);

create policy "Authenticated read app_users"
on app_users for select
to authenticated
using (true);

create policy "Authenticated insert audit"
on audit_log for insert
to authenticated
with check (true);

create policy "Authenticated read audit"
on audit_log for select
to authenticated
using (true);

-- =========================================================
-- Helper view: today's check-ins (for staff dashboard)
-- =========================================================
create or replace view todays_visits as
select
  v.id,
  v.visited_at,
  v.status as visit_status,
  c.id as customer_id,
  c.ic,
  c.name,
  c.phone,
  c.status as customer_status,
  c.warning_count,
  c.ban_reason
from visits v
left join customers c on v.customer_id = c.id
where v.visited_at >= date_trunc('day', now())
order by v.visited_at desc;

-- Done!
