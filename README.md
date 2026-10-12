# Video Game Prediction Bingo

Make prediction bingo cards for game showcases like Nintendo Direct, State of Play and the Xbox Games Showcase, and share them with friends or a stream's chat. Live at [videogamebingo.com](https://videogamebingo.com).

Built with Next.js 15 (App Router) and Tailwind CSS, hosted on Vercel, with cards stored in Supabase Postgres.

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** for development at [supabase.com](https://supabase.com) (the free plan is fine; pick the East US region to sit next to Vercel's default region). Keep "Enable Data API" on.

3. **Run the migration.** In the project's SQL editor, paste and run [`supabase/migrations/001_cards.sql`](supabase/migrations/001_cards.sql).

4. **Configure environment variables.** Copy `.env.example` to `.env.local` and fill it in (see below).

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name | Secret? | Where to find it | Used for |
|---|---|---|---|
| `SUPABASE_URL` | No, but keep server-only | Supabase → Project Settings → Data API | Database connection |
| `SUPABASE_SECRET_KEY` | **Yes** | Supabase → Project Settings → API Keys → Secret keys (`sb_secret_…`) | Server access to the database. Bypasses row-level security |
| `IP_HASH_SALT` | **Yes** | Generate with `openssl rand -hex 32` | Hashing IPs for rate limiting, so raw IPs are never stored |
| `CRON_SECRET` | **Yes** | Generate with `openssl rand -hex 32` | Authenticating the daily cleanup job |
| `NEXT_PUBLIC_GTM_ID` | No (public by design) | Google Tag Manager | Analytics, loaded only after cookie consent |

> **Never add the `NEXT_PUBLIC_` prefix to a secret.** Next.js copies `NEXT_PUBLIC_*` variables into the JavaScript sent to browsers. Everything else stays on the server.

On Vercel, set the same variables under Project Settings → Environment Variables, and mark the secret ones as **Sensitive**. `NEXT_PUBLIC_*` values are baked in at build time, so changing one requires a redeploy.

## How short card links work

When someone clicks "Create my card", the card is saved through `POST /api/cards` and they're sent to a short link like `/s/aZ3kP9qX`. If saving fails for any reason, they get the older self-contained link (`/c/<encoded card>`) instead, so card creation never breaks. Old `/c/` and `/?s=` links keep working forever.

- Cards are read through Next's data cache (1 hour), so a stream's chat opening the same link at once costs about one database read.
- Anonymous cards are deleted after **7 days without a visit** (`ANON_CARD_TTL_DAYS` in `src/app/lib/constants.ts`).
- Creating cards is rate limited per IP and site-wide (`src/app/lib/server/rateLimit.ts`). Viewing is never limited.

The full design, including plans for user accounts, is in [`docs/proposals/short-card-urls.md`](docs/proposals/short-card-urls.md).

### Where things live

| Path | What it does |
|---|---|
| `src/app/api/cards/route.ts` | Creates cards (validation, origin check, rate limit) |
| `src/app/s/[id]/` | Short card page, plus its not-found and error pages |
| `src/app/c/[card]/` | Self-contained encoded card links |
| `src/app/lib/server/` | Server-only Supabase client, card storage, ids, rate limiting |
| `src/app/api/cron/cleanup/route.ts` | Daily cleanup, scheduled in `vercel.json` |
| `supabase/migrations/` | Database schema and functions, run by hand in the SQL editor |

## Operations

### Taking down a card

Run this in the production project's SQL editor:

```sql
update public.cards set disabled = true where id = '<card id>' returning id, disabled;
```

Visitors see the same "We couldn't find this card" page as for a missing card. Because card reads are cached, it can take **up to an hour** to take effect.

### Daily cleanup

Vercel Cron calls `/api/cron/cleanup` once a day (09:00 UTC). It deletes anonymous cards not visited in 7 days and rate-limit rows older than 2 days. To run it by hand:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://videogamebingo.com/api/cron/cleanup
```

It responds with how many rows were deleted, e.g. `{"cards":3,"rate_limits":120}`.

### If Supabase pauses the project

Free Supabase projects pause after about a week without activity. The daily cleanup should keep it active, but if it does pause:

- New cards fall back to long `/c/` links automatically.
- Short links show "We couldn't load this card".
- Restore the project from the Supabase dashboard soon. Paused free projects can only be restored for a limited time, so check Supabase's current policy.

### Analytics

Google Tag Manager loads only after a visitor accepts cookies. Custom events (`generate_card`, `share_card`, `card_link_fallback`, `card_not_found`, `card_load_error`, `stream_mode_toggle`, `shuffle_board`) are pushed to the `dataLayer`. Each needs a matching trigger and GA4 event tag in the Tag Manager container to show up in Google Analytics.
