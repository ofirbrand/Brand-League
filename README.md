# Brand Sport League 🏆

Family-only fitness leaderboard PWA for the Brand family. Three categories: **Steps**, **Running km**, **Weight Loss %**. Olympic-style podiums (🥇🥈🥉), weekly + all-time standings, Profile trend charts, and a WhatsApp-shareable podium snippet on each category page.

## Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres + Auth) — RLS, whitelist trigger, profile autocreate trigger
- Tailwind v4 + shadcn/ui (Base UI under the hood)
- Recharts (trend charts) · canvas-confetti (podium-move celebration) · Framer Motion (subtle motion)
- PWA: manifest + maskable icons + minimal service worker shell cache + custom Install banner
- Hosted on Vercel (free tier) + Supabase free tier

## Local development

```bash
npm install
cp .env.example .env.local         # fill in NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
npm run dev                        # → http://localhost:3000
```

See [SETUP.md](./SETUP.md) for full Supabase project setup, schema migration, and admin promotion steps.

## Useful scripts

```bash
npm run dev         # Next.js dev server (Turbopack)
npm run build       # production build (validates TS + routes)
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run icons       # regenerate PWA icons from public/logo.svg
npm run db:push     # apply supabase/migrations to linked project
npm run db:reset    # drop + recreate local DB (re-applies seed.sql)
npm run db:types    # regenerate src/lib/supabase/types.ts from linked DB
```

## Repo map

```
src/
├── app/
│   ├── layout.tsx               # providers, metadata, dark theme
│   ├── (auth)/                  # login, signup, reset-password (no shell)
│   ├── auth/callback/route.ts   # email-verification PKCE exchange
│   └── (app)/                   # authenticated routes
│       ├── layout.tsx           # auth gate, navbar, FAB, LogSheet, PWA
│       ├── page.tsx             # General/Home — 3 podiums
│       ├── steps|running|weight # category pages
│       ├── profile              # editable profile, charts, history
│       └── admin                # whitelist + baseline weight admin
├── components/
│   ├── shell/                   # nav, FAB, logo, PWA bootstrap
│   ├── podium/                  # Podium, ShareButton
│   ├── leaderboard/
│   ├── log/                     # FAB drawer + 3 forms + context
│   ├── charts/                  # TrendChart (Recharts)
│   ├── profile/                 # ProfileHeader, RankingsCards, ActivityHistory
│   └── ui/                      # shadcn primitives
├── lib/
│   ├── supabase/                # client/server/middleware + Database types
│   ├── domain/                  # week math, ranking, weight, validation, avatars
│   ├── queries/                 # leaderboards (server) + logs (client) + profile (server)
│   ├── auth/errors.ts
│   └── confetti.ts
├── middleware.ts                # auth-required redirects
supabase/
├── config.toml
├── migrations/                  # 0001_init / 0002_views / 0003_rls / 0004_triggers
└── seed.sql                     # initial allowed_emails
```

## Decisions

All product/UX/data decisions are pinned in `~/.claude/plans/i-want-to-build-prancy-hearth.md`. Highlights:

- Week = Sunday → Saturday in **Asia/Jerusalem**.
- Weight loss % = `(baseline − current) / baseline × 100`. Baseline = registration weight (admin-only edit). Negatives shown but no medal.
- Tie-break = Olympic-style RANK() (`rk = 1, 1, 3` — silver slot empty when two share gold).
- Steps/Weight = UPSERT one row per user per local day. Runs = append-only.
- All-time podium metric = total cumulative since registration (Steps + Running) / current loss-% from baseline (Weight).

## License

Private — Brand family only.
