-- Seed for Brand Sport League local/dev DB.
-- Adds the founding admin email so Ofir can sign up. After he signs up,
-- promote him to admin manually via Supabase Studio:
--   update public.profiles set is_admin = true
--    where user_id = (select id from auth.users where email = 'ofir.b@masterschool.com');

insert into public.allowed_emails (email)
values ('ofir.b@masterschool.com')
on conflict (email) do nothing;
