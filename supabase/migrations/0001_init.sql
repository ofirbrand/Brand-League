-- Brand Sport League — initial schema
-- One-time setup: tables, indexes, and column-level CHECKs.
-- Time semantics: log_date is a calendar DATE, interpreted as Asia/Jerusalem
-- by all aggregation views. timestamptz fields use UTC and are bucketed by
-- application-level helpers when needed.

-- =========================================================================
-- allowed_emails: signup gate. Email must exist here to register.
-- =========================================================================
create table public.allowed_emails (
  email      text primary key,
  added_by   uuid references auth.users(id) on delete set null,
  added_at   timestamptz not null default now()
);

-- =========================================================================
-- profiles: 1:1 with auth.users. Created automatically on signup
-- (see 0004_triggers.sql).
-- =========================================================================
create table public.profiles (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  full_name          text not null check (length(full_name) between 1 and 80),
  nickname           text not null check (length(nickname) between 1 and 40),
  height_cm          numeric(5,1) not null check (height_cm between 50 and 250),
  baseline_weight_kg numeric(5,2) not null check (baseline_weight_kg between 30 and 300),
  avatar_emoji       text not null default '🏃' check (length(avatar_emoji) between 1 and 8),
  is_admin           boolean not null default false,
  registered_at      timestamptz not null default now()
);

create unique index profiles_nickname_lower_idx
  on public.profiles (lower(nickname));

-- =========================================================================
-- step_logs: ONE row per (user_id, log_date). UPSERT replaces.
-- =========================================================================
create table public.step_logs (
  user_id    uuid not null references auth.users(id) on delete cascade,
  log_date   date not null,
  steps      integer not null check (steps > 0 and steps <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

-- =========================================================================
-- run_logs: append-only. Multiple per day allowed; weekly = SUM.
-- =========================================================================
create table public.run_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  log_date     date not null,
  distance_km  numeric(5,2) not null check (distance_km > 0 and distance_km <= 100),
  duration_min integer not null check (duration_min > 0 and duration_min <= 600),
  created_at   timestamptz not null default now()
);
create index run_logs_user_date_idx on public.run_logs(user_id, log_date);

-- =========================================================================
-- weight_logs: ONE row per (user_id, log_date). UPSERT replaces.
-- =========================================================================
create table public.weight_logs (
  user_id    uuid not null references auth.users(id) on delete cascade,
  log_date   date not null,
  weight_kg  numeric(5,2) not null check (weight_kg between 30 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

-- =========================================================================
-- updated_at auto-bump for UPSERT-replace tables
-- =========================================================================
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end $$ language plpgsql;

create trigger step_logs_touch_updated_at
  before update on public.step_logs
  for each row execute function public.touch_updated_at();

create trigger weight_logs_touch_updated_at
  before update on public.weight_logs
  for each row execute function public.touch_updated_at();
