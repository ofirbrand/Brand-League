-- Brand Sport League — app_settings
-- Lightweight key/value-ish table for DB-configurable runtime values.
-- Currently used for the General page "End of Competition" countdown.

-- =========================================================================
-- Table
-- =========================================================================
create table public.app_settings (
  key                text primary key,
  label              text not null,
  value_timestamptz  timestamptz not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- updated_at auto-bump (reuses public.touch_updated_at from 0001_init.sql)
create trigger app_settings_touch_updated_at
  before update on public.app_settings
  for each row execute function public.touch_updated_at();

-- =========================================================================
-- RLS — authenticated users read; admins write
-- =========================================================================
alter table public.app_settings enable row level security;

create policy "app_settings_select_authenticated"
  on public.app_settings for select
  to authenticated using (true);

create policy "app_settings_admin_insert"
  on public.app_settings for insert
  to authenticated with check (public.is_admin());

create policy "app_settings_admin_update"
  on public.app_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "app_settings_admin_delete"
  on public.app_settings for delete
  to authenticated using (public.is_admin());

grant select on public.app_settings to authenticated;
grant insert, update, delete on public.app_settings to authenticated;

-- =========================================================================
-- Seed: End of Competition — Aug 10, 2026 20:00 Asia/Jerusalem (IDT, UTC+3)
-- =========================================================================
insert into public.app_settings (key, label, value_timestamptz)
values (
  'competition_end_at',
  'End of Competition',
  timestamptz '2026-08-10 20:00:00+03'
)
on conflict (key) do nothing;
