# Brand Sport League — Setup

One-time steps to get the app running locally and in production.

## 1. Supabase project (you do this once in the browser)

1. Go to <https://supabase.com> → **New project**.
2. Name: `brand-sport-league` · Region: `eu-central-1` (Frankfurt — closest to Israel) · DB password: anything (save it).
3. Wait for the project to provision (~2 min).
4. From the project's **Settings → API** copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Save those two values into `.env.local` (copy `.env.example`).

## 2. Apply schema (terminal)

```bash
npx supabase login                        # opens browser, paste access token
npx supabase link --project-ref <REF>     # the part after https:// in your project URL
npm run db:push                           # applies all migrations in supabase/migrations
```

If `db:push` fails (first time on a fresh project sometimes does), run again — it's idempotent.

Then in Supabase Studio → **SQL Editor**, run `supabase/seed.sql` once to add Ofir's email to the whitelist.

## 3. Promote Ofir to admin (after first signup)

After you sign up at the app for the first time, in Supabase Studio → **SQL Editor** run:

```sql
update public.profiles set is_admin = true
 where user_id = (select id from auth.users where email = 'ofir.b@masterschool.com');
```

From then on, `/admin` becomes accessible and you can add the rest of the family to the whitelist via the UI.

## 4. Auth Site URL (production)

In Supabase Studio → **Authentication → URL Configuration**:

- `Site URL`: `https://brand-sport-league.vercel.app` (or your custom domain)
- `Redirect URLs`: add the same URL

This ensures email-verification and password-reset links point to the right domain.

## 5. Run locally

```bash
npm run dev
# → http://localhost:3000
```

## 6. Deploy

See `Phase 11` of the plan: push to GitHub, connect to Vercel, set the two env vars in Vercel project settings, deploy.
