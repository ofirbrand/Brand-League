-- Brand Sport League — auth triggers
-- Two responsibilities:
--   1. Whitelist gate: reject signups with non-whitelisted emails.
--   2. Profile autocreate: read profile fields from raw_user_meta_data and
--      INSERT a matching public.profiles row.

-- =========================================================================
-- 1) Whitelist gate
-- =========================================================================
create or replace function public.check_email_whitelist() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is null or trim(new.email) = '' then
    raise exception 'EMAIL_REQUIRED';
  end if;
  if not exists (
    select 1 from public.allowed_emails where lower(email) = lower(new.email)
  ) then
    raise exception 'EMAIL_NOT_WHITELISTED';
  end if;
  return new;
end $$;

drop trigger if exists before_auth_user_insert_whitelist on auth.users;
create trigger before_auth_user_insert_whitelist
  before insert on auth.users
  for each row execute function public.check_email_whitelist();

-- =========================================================================
-- 2) Profile autocreate
-- raw_user_meta_data must include: full_name, nickname, height_cm,
-- baseline_weight_kg, avatar_emoji.
-- =========================================================================
create or replace function public.handle_new_user_profile() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_full_name          text;
  v_nickname           text;
  v_height_cm          numeric;
  v_baseline_weight_kg numeric;
  v_avatar_emoji       text;
begin
  v_full_name          := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  v_nickname           := nullif(trim(new.raw_user_meta_data->>'nickname'), '');
  v_height_cm          := (new.raw_user_meta_data->>'height_cm')::numeric;
  v_baseline_weight_kg := (new.raw_user_meta_data->>'baseline_weight_kg')::numeric;
  v_avatar_emoji       := coalesce(nullif(trim(new.raw_user_meta_data->>'avatar_emoji'), ''), '🏃');

  if v_full_name is null or v_nickname is null
     or v_height_cm is null or v_baseline_weight_kg is null then
    raise exception 'PROFILE_FIELDS_REQUIRED';
  end if;

  insert into public.profiles (
    user_id, full_name, nickname, height_cm, baseline_weight_kg, avatar_emoji
  ) values (
    new.id, v_full_name, v_nickname, v_height_cm, v_baseline_weight_kg, v_avatar_emoji
  );

  return new;
end $$;

drop trigger if exists after_auth_user_insert_profile on auth.users;
create trigger after_auth_user_insert_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
