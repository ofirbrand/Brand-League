-- Brand Sport League — aggregation views
-- All week math anchors on Sunday (Asia/Jerusalem convention). log_date is a
-- DATE (the user's intended calendar day), so timezone math is unnecessary
-- for date-only arithmetic.
--
-- week_start_for(d) returns the Sunday that opens d's Sunday-Saturday week.
--   Postgres extract(dow) → Sunday=0, Monday=1, ... Saturday=6.
--   So week_start = d - dow.

create or replace function public.week_start_for(d date)
returns date
language sql immutable as $$
  select d - (extract(dow from d)::int);
$$;

-- =========================================================================
-- WEEKLY TOTALS
-- =========================================================================

create or replace view public.v_weekly_step_totals as
  select
    user_id,
    public.week_start_for(log_date) as week_start,
    sum(steps)::bigint               as total_steps
  from public.step_logs
  group by user_id, public.week_start_for(log_date);

create or replace view public.v_weekly_run_totals as
  select
    user_id,
    public.week_start_for(log_date)         as week_start,
    sum(distance_km)::numeric(10,2)         as total_km,
    sum(duration_min)::int                  as total_minutes,
    count(*)::int                           as run_count
  from public.run_logs
  group by user_id, public.week_start_for(log_date);

-- Per-user weekly weight series: average weight in that week (for trend
-- charts). Note loss% on the weekly chart anchors against profile baseline.
create or replace view public.v_weekly_weight_avg as
  select
    wl.user_id,
    public.week_start_for(wl.log_date)               as week_start,
    avg(wl.weight_kg)::numeric(6,2)                  as avg_weight_kg,
    p.baseline_weight_kg,
    case
      when p.baseline_weight_kg is null or p.baseline_weight_kg = 0 then null
      else ((p.baseline_weight_kg - avg(wl.weight_kg)) / p.baseline_weight_kg * 100)::numeric(6,2)
    end                                              as loss_pct
  from public.weight_logs wl
  join public.profiles p on p.user_id = wl.user_id
  group by wl.user_id, public.week_start_for(wl.log_date), p.baseline_weight_kg;

-- =========================================================================
-- ALL-TIME TOTALS  (cumulative since registration; one row per registered user)
-- =========================================================================

create or replace view public.v_all_time_step_totals as
  select
    p.user_id,
    coalesce(sum(s.steps), 0)::bigint as total_steps
  from public.profiles p
  left join public.step_logs s on s.user_id = p.user_id
  group by p.user_id;

create or replace view public.v_all_time_run_totals as
  select
    p.user_id,
    coalesce(sum(r.distance_km), 0)::numeric(12,2) as total_km,
    coalesce(sum(r.duration_min), 0)::int          as total_minutes,
    coalesce(count(r.id), 0)::int                  as run_count
  from public.profiles p
  left join public.run_logs r on r.user_id = p.user_id
  group by p.user_id;

-- =========================================================================
-- CURRENT WEIGHT STATE
-- One row per registered user. latest_weight_kg = NULL when user has no
-- weight log yet (UI shows "📏 Awaiting first check-in"). loss_pct is also
-- NULL in that case.
-- =========================================================================

create or replace view public.v_current_weight_state as
  select
    p.user_id,
    p.baseline_weight_kg,
    latest.weight_kg as latest_weight_kg,
    latest.log_date  as latest_log_date,
    case
      when latest.weight_kg is null or p.baseline_weight_kg = 0 then null
      else ((p.baseline_weight_kg - latest.weight_kg) / p.baseline_weight_kg * 100)::numeric(6,2)
    end as loss_pct
  from public.profiles p
  left join lateral (
    select weight_kg, log_date
    from public.weight_logs
    where user_id = p.user_id
    order by log_date desc, updated_at desc
    limit 1
  ) latest on true;

-- =========================================================================
-- LEADERBOARDS  (ranked, with Olympic-style RANK() ties)
-- These views include EVERY registered user, so newcomers with zero
-- activity still appear at the bottom. Negative loss is allowed (no medal,
-- but still ranked); NULL loss (no weight log) sorts last.
-- =========================================================================

create or replace view public.v_leaderboard_steps_all_time as
  select
    p.user_id,
    p.nickname,
    p.full_name,
    p.avatar_emoji,
    t.total_steps,
    rank() over (order by t.total_steps desc) as rk
  from public.v_all_time_step_totals t
  join public.profiles p on p.user_id = t.user_id;

create or replace view public.v_leaderboard_run_all_time as
  select
    p.user_id,
    p.nickname,
    p.full_name,
    p.avatar_emoji,
    t.total_km,
    t.total_minutes,
    t.run_count,
    rank() over (order by t.total_km desc) as rk
  from public.v_all_time_run_totals t
  join public.profiles p on p.user_id = t.user_id;

-- Weight: NULL loss_pct sorts last via NULLS LAST.
create or replace view public.v_leaderboard_weight_all_time as
  select
    p.user_id,
    p.nickname,
    p.full_name,
    p.avatar_emoji,
    w.baseline_weight_kg,
    w.latest_weight_kg,
    w.latest_log_date,
    w.loss_pct,
    rank() over (order by w.loss_pct desc nulls last) as rk
  from public.v_current_weight_state w
  join public.profiles p on p.user_id = w.user_id;

-- Weekly leaderboards: scoped to a chosen week_start. Callers pass the
-- current Sunday via the `week_start = $1` filter; the view itself yields
-- one set of rows per (user, week) pair.
create or replace view public.v_leaderboard_steps_weekly as
  select
    p.user_id,
    p.nickname,
    p.full_name,
    p.avatar_emoji,
    t.week_start,
    t.total_steps,
    rank() over (partition by t.week_start order by t.total_steps desc) as rk
  from public.v_weekly_step_totals t
  join public.profiles p on p.user_id = t.user_id;

create or replace view public.v_leaderboard_run_weekly as
  select
    p.user_id,
    p.nickname,
    p.full_name,
    p.avatar_emoji,
    t.week_start,
    t.total_km,
    t.total_minutes,
    t.run_count,
    rank() over (partition by t.week_start order by t.total_km desc) as rk
  from public.v_weekly_run_totals t
  join public.profiles p on p.user_id = t.user_id;

-- For the WEIGHT category, we use the same all-time view for the "weekly"
-- podium too — weight is not a weekly-effort metric, so the weekly podium
-- mirrors all-time in this category. (Decision in plan: weight doesn't have
-- a separate weekly podium concept; the weekly view on the Weight page
-- shows the same loss-% leaderboard.)
