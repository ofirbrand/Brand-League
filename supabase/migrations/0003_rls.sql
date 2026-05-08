-- Brand Sport League — Row-Level Security policies
--
-- Strategy:
--   * All authenticated users may SELECT every leaderboard-relevant table.
--     This is a family app; everyone is on the same team.
--   * Users may INSERT/UPDATE/DELETE only their own log rows.
--   * Profile self-update is allowed except for `baseline_weight_kg`, which
--     is admin-only (enforced by a column-level trigger because RLS does not
--     gate column UPDATEs natively).
--   * Admin (`profiles.is_admin = true`) is bypassed via dedicated policies.

-- helper: current user's admin flag
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where user_id = auth.uid()), false);
$$;

-- =========================================================================
-- allowed_emails: admin-only writes; all authenticated reads
-- =========================================================================
alter table public.allowed_emails enable row level security;

create policy "allowed_emails_select_authenticated"
  on public.allowed_emails for select
  to authenticated using (true);

create policy "allowed_emails_admin_insert"
  on public.allowed_emails for insert
  to authenticated with check (public.is_admin());

create policy "allowed_emails_admin_delete"
  on public.allowed_emails for delete
  to authenticated using (public.is_admin());

-- =========================================================================
-- profiles
-- =========================================================================
alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles_self_update"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "profiles_admin_update_any"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Block users from changing baseline_weight_kg (admin-only). RLS can't gate
-- by column, so we use a trigger.
create or replace function public.guard_profile_baseline_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.baseline_weight_kg is distinct from old.baseline_weight_kg
     and not public.is_admin() then
    raise exception 'BASELINE_WEIGHT_ADMIN_ONLY';
  end if;
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    raise exception 'ADMIN_FLAG_ADMIN_ONLY';
  end if;
  return new;
end $$;

create trigger profiles_guard_protected_columns
  before update on public.profiles
  for each row execute function public.guard_profile_baseline_change();

-- =========================================================================
-- step_logs / run_logs / weight_logs: own rows + admin override
-- =========================================================================

alter table public.step_logs enable row level security;
alter table public.run_logs  enable row level security;
alter table public.weight_logs enable row level security;

-- step_logs
create policy "step_logs_select_authenticated"
  on public.step_logs for select to authenticated using (true);
create policy "step_logs_self_write"
  on public.step_logs for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- run_logs
create policy "run_logs_select_authenticated"
  on public.run_logs for select to authenticated using (true);
create policy "run_logs_self_write"
  on public.run_logs for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- weight_logs
create policy "weight_logs_select_authenticated"
  on public.weight_logs for select to authenticated using (true);
create policy "weight_logs_self_write"
  on public.weight_logs for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- =========================================================================
-- Grant view selects to authenticated (Postgres views inherit privileges
-- from underlying tables, but we grant explicitly for clarity).
-- =========================================================================

grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on
  public.profiles,
  public.step_logs,
  public.run_logs,
  public.weight_logs,
  public.allowed_emails
  to authenticated;
