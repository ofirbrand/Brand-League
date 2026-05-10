-- Brand Sport League — past-day step lock
-- Steps for any past day in Asia/Jerusalem are first-time-only and immutable
-- once logged. Today is always editable (UPSERT replaces). Admins
-- (`public.is_admin()`) bypass the lock so Ofir can fix mistakes.

create or replace function public.guard_step_past_day_lock()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  today_jer date := (now() at time zone 'Asia/Jerusalem')::date;
  exists_row boolean;
begin
  if public.is_admin() then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_op = 'INSERT' then
    if new.log_date < today_jer then
      select exists (
        select 1 from public.step_logs
        where user_id = new.user_id and log_date = new.log_date
      ) into exists_row;
      if exists_row then
        raise exception 'STEPS_PAST_DAY_LOCKED';
      end if;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- Block touching a past-day row OR moving any row onto a past day.
    if old.log_date < today_jer or new.log_date < today_jer then
      raise exception 'STEPS_PAST_DAY_LOCKED';
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.log_date < today_jer then
      raise exception 'STEPS_PAST_DAY_LOCKED';
    end if;
    return old;
  end if;

  return new;
end $$;

drop trigger if exists step_logs_guard_past_day_lock on public.step_logs;
create trigger step_logs_guard_past_day_lock
  before insert or update or delete on public.step_logs
  for each row execute function public.guard_step_past_day_lock();
