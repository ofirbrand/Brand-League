-- Brand Sport League — Gym category
-- Append-only gym_logs (multiple sessions per day allowed). Score = SUM(duration_min).
-- Activity = enum (gym | studio | other) recorded per row, surfaced in history;
-- it does not affect ranking.

-- =========================================================================
-- 1) Enum + table + index
-- =========================================================================

create type public.gym_activity as enum ('gym', 'studio', 'other');

create table public.gym_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  log_date     date not null,
  duration_min integer not null check (duration_min > 0 and duration_min <= 600),
  activity     public.gym_activity not null,
  created_at   timestamptz not null default now()
);

create index gym_logs_user_date_idx on public.gym_logs(user_id, log_date);

-- =========================================================================
-- 2) Aggregation views — mirror the run_logs pattern
-- =========================================================================

create or replace view public.v_weekly_gym_totals as
  select
    user_id,
    public.week_start_for(log_date) as week_start,
    sum(duration_min)::int          as total_minutes,
    count(*)::int                   as session_count
  from public.gym_logs
  group by user_id, public.week_start_for(log_date);

create or replace view public.v_all_time_gym_totals as
  select
    p.user_id,
    coalesce(sum(g.duration_min), 0)::int as total_minutes,
    coalesce(count(g.id), 0)::int         as session_count
  from public.profiles p
  left join public.gym_logs g on g.user_id = p.user_id
  group by p.user_id;

create or replace view public.v_leaderboard_gym_all_time as
  select
    p.user_id,
    p.nickname,
    p.full_name,
    p.avatar_emoji,
    t.total_minutes,
    t.session_count,
    rank() over (order by t.total_minutes desc) as rk
  from public.v_all_time_gym_totals t
  join public.profiles p on p.user_id = t.user_id;

create or replace view public.v_leaderboard_gym_weekly as
  select
    p.user_id,
    p.nickname,
    p.full_name,
    p.avatar_emoji,
    t.week_start,
    t.total_minutes,
    t.session_count,
    rank() over (partition by t.week_start order by t.total_minutes desc) as rk
  from public.v_weekly_gym_totals t
  join public.profiles p on p.user_id = t.user_id;

-- =========================================================================
-- 3) RLS — copy the run_logs shape: select-authenticated + self-write + admin override
-- =========================================================================

alter table public.gym_logs enable row level security;

create policy "gym_logs_select_authenticated"
  on public.gym_logs for select to authenticated using (true);

create policy "gym_logs_self_write"
  on public.gym_logs for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

grant select on public.gym_logs to authenticated;
grant insert, update, delete on public.gym_logs to authenticated;
