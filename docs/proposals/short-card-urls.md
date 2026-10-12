# Proposal: Short card URLs

**Status:** Draft for review
**Stack:** Next.js 15 on Vercel (Hobby, free) + Supabase (free tier)
**Scope of this phase:** Creating and serving short card URLs. User profiles are out of scope, but the design leaves room for them (see [Designing ahead for user profiles](#11-designing-ahead-for-user-profiles)).

---

## 1. Summary

Today a card is fully encoded in its URL (`/c/<deflate+base64 payload>`). Links can run to hundreds or thousands of characters, which is awkward to paste into Twitch or Discord chat.

This proposal stores each card in Supabase Postgres and gives it a short random ID, so the URL becomes `/s/aZ3kP9qX`. The short URL is the only URL a new card gets: clicking "Create my card" stores it and redirects to `/s/<id>`, so the address bar and the share button both use the short URL.

Anonymous cards are deleted after **7 days without a visit**. That fits the main use case: a streamer makes a card when a showcase is announced, shares it with chat, and the card is no longer needed a few days after the show.

## 2. Goals and non-goals

**Goals**

- Every newly created card has a short URL (`/s/<8 chars>`).
- Thousands of viewers opening the same link at once costs about one database read, not thousands.
- Anonymous cards that nobody has opened for 7 days are deleted automatically.
- No accounts are needed to create or share a card.
- The create endpoint is protected against abuse without adding friction for real users.
- Existing `/c/...` and `/?s=...` links keep working forever.
- Everything runs on free tiers.
- The schema and code are ready for user-owned cards and Supabase Auth without a rewrite.

**Non-goals (this phase)**

- User accounts, login, "My cards", or editing a card after it's created.
- An admin UI. Moderation is a SQL statement for now.
- View analytics per card.
- Converting old `/c/...` links into short links.

## 3. How a card moves through the system

```
CREATE
  CardMaker "Create my card"
    → POST /api/cards  { gridSize, options, includeFreeSpace, themeKey }
        1. Cap body size, parse JSON, validate with toCardState()
        2. rpc check_create_limits(ip hash)   → per-IP and global rate limits
        3. Hash the normalized card (SHA-256)
        4. rpc create_card(id, hash, payload) → new ID, or the existing ID if this exact card already exists
    ← 201 { id }
    → router.push(`/s/${id}`)
  On any failure (network, 429, 5xx, timeout):
    → router.push(`/c/${encodeCard(card)}`)        // current behavior

VIEW
  GET /s/[id]
    1. Reject IDs that don't match /^[0-9A-Za-z]{8}$/   → 404 page
    2. getCard(id), wrapped in the Next data cache (1 h, tag card:<id>)
         cache miss → SELECT payload, disabled FROM cards
    3. Missing, disabled, or invalid payload            → "We couldn't find this card" page (404)
    4. Render <BingoCard card={…} />
    5. after(): touchCard(id), at most one rpc touch_card per card per day per instance

CLEANUP (daily Vercel Cron)
  GET /api/cron/cleanup   (Authorization: Bearer $CRON_SECRET)
    rpc cleanup_expired(7)
      DELETE anonymous cards with last_accessed_at older than 7 days
      DELETE rate-limit rows older than 2 days
```

The creator's own redirect to `/s/<id>` is the first read, so the cache is already filled before they paste the link into chat. When the burst arrives, viewer requests are cache hits.

## 4. Supabase setup

### 4.1 How the server talks to Supabase

- **Client:** `@supabase/supabase-js`, using the **secret key**, on the server only. It sends every query over HTTPS through Supabase's API, so serverless functions never hold database connections open, and a traffic spike can't exhaust them. It's also the library Supabase Auth uses, so user profiles won't need a second database client.
- **Write logic lives in Postgres functions** (`create_card`, `touch_card`, `check_create_limits`, `cleanup_expired`), called with `.rpc()`. supabase-js's query builder can't express things like "insert, or return the existing row matching a partial unique index". As functions, each of those steps is a single atomic call, and the SQL stays in the migration file where it can be reviewed.
- **Reads** use the normal query builder: `.from("cards").select("payload, disabled").eq("id", id).maybeSingle()`.

### 4.2 Locking it down

Supabase publishes every table and function in the `public` schema through its API. Right now the site only uses the secret key, on the server, but adding Supabase Auth later means shipping the **publishable** key to browsers. The migration closes off the tables and functions now, so that later change can't accidentally expose anything:

- **Row Level Security is on for both tables, with no policies.** Requests made with the publishable key can't read or write them at all. The secret key bypasses RLS, so server code is unaffected.
- **`EXECUTE` on every function is revoked** from `public`, `anon` and `authenticated`. Only the secret key can call them.
- **Every function sets `search_path = public`.** This stops a function from being tricked into running a different object with the same name, and it's what Supabase's security advisor checks for.

### 4.3 Projects

| Project | Purpose |
|---|---|
| `game-prediction-bingo` | Production. Its URL and secret key go in Vercel's environment variables |
| `game-prediction-bingo-dev` | Local development. Its URL and secret key go in `.env.local` |

Supabase's free plan allows two projects. Database branching is a paid feature, so the dev database is a separate free project. Supabase's local CLI would also work, but it requires installing the CLI and Docker, which is unnecessary for now.

## 5. Data model

One migration file, `supabase/migrations/001_cards.sql`. You run it by hand in each project's SQL editor. There's no migration tool in this phase.

```sql
-- ────────────────────────────── Tables ──────────────────────────────

create table public.cards (
  id                text        primary key,               -- 8-char base62
  content_hash      text        not null,                  -- sha-256 hex of normalized payload
  payload           jsonb       not null,                  -- { gridSize, options, includeFreeSpace, themeKey }
  owner_id          uuid        null,                      -- always null this phase; FK added with user profiles
  created_at        timestamptz not null default now(),
  last_accessed_at  timestamptz not null default now(),
  disabled          boolean     not null default false
);

-- Dedup for anonymous cards: the same card content returns the same ID
create unique index cards_anon_content_hash
  on public.cards (content_hash) where owner_id is null;

-- Lets the cleanup query find expired anonymous cards quickly
create index cards_anon_last_accessed
  on public.cards (last_accessed_at) where owner_id is null;

create table public.rate_limits (
  key           text        not null,                      -- e.g. "ip:<hash>:minute", "global:minute"
  window_start  timestamptz not null,
  count         integer     not null,
  primary key (key, window_start)
);

-- RLS on with no policies: the publishable key can't touch these tables
alter table public.cards       enable row level security;
alter table public.rate_limits enable row level security;

-- ──────────────────────────── Functions ─────────────────────────────

-- Returns the new or existing card id; null means the random id collided and the caller should retry
create function public.create_card(p_id text, p_hash text, p_payload jsonb)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_id text;
begin
  insert into cards (id, content_hash, payload)
  values (p_id, p_hash, p_payload)
  on conflict do nothing
  returning id into v_id;

  if v_id is not null then
    return v_id;
  end if;

  -- Same content already exists: reuse it and restart its 7-day clock
  update cards
  set last_accessed_at = now()
  where content_hash = p_hash and owner_id is null
  returning id into v_id;

  return v_id;
end;
$$;

create function public.touch_card(p_id text)
returns void
language sql
set search_path = public
as $$
  update cards
  set last_accessed_at = now()
  where id = p_id and last_accessed_at < now() - interval '1 day';
$$;

-- Counts this request in each window; returns false if any limit is exceeded
create function public.check_create_limits(
  p_ip_key text,
  p_ip_per_minute int,
  p_ip_per_day int,
  p_global_per_minute int
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_ip_minute int;
  v_ip_day int;
  v_global_minute int;
begin
  insert into rate_limits (key, window_start, count)
  values (p_ip_key || ':minute', date_trunc('minute', now()), 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into v_ip_minute;

  insert into rate_limits (key, window_start, count)
  values (p_ip_key || ':day', date_trunc('day', now()), 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into v_ip_day;

  insert into rate_limits (key, window_start, count)
  values ('global:minute', date_trunc('minute', now()), 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into v_global_minute;

  return v_ip_minute <= p_ip_per_minute
     and v_ip_day <= p_ip_per_day
     and v_global_minute <= p_global_per_minute;
end;
$$;

create function public.cleanup_expired(p_ttl_days int)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_cards int;
  v_limits int;
begin
  delete from cards
  where owner_id is null
    and last_accessed_at < now() - make_interval(days => p_ttl_days);
  get diagnostics v_cards = row_count;

  delete from rate_limits where window_start < now() - interval '2 days';
  get diagnostics v_limits = row_count;

  return jsonb_build_object('cards', v_cards, 'rate_limits', v_limits);
end;
$$;

-- Only the secret key (service_role) may call these
revoke execute on function
  public.create_card(text, text, jsonb),
  public.touch_card(text),
  public.check_create_limits(text, int, int, int),
  public.cleanup_expired(int)
from public, anon, authenticated;
```

**Why these choices**

- **Partial unique index instead of a plain unique index on `content_hash`.** Dedup applies only between anonymous cards. When user profiles arrive, owned cards get their own index (section 11), so an anonymous card and a user's card with the same content never resolve to each other.
- **Two people creating the same card at the same moment is handled.** If two identical inserts race, the second one's `on conflict do nothing` waits for the first to commit. Its `update` then finds the committed row, so both get the same ID.
- **`payload` as `jsonb`, validated again on read.** The read path runs the stored payload through `toCardState()` too. If the card shape ever changes, a bad or outdated row shows the not-found page instead of crashing the page.
- **`owner_id` column now, foreign key later.** Adding the column now means the cleanup query and indexes are already correct for user profiles. The foreign key needs the profiles table, so it waits.
- **Rate limits in Postgres.** Creates are rare compared with reads, so a counter row per IP per window costs nothing noticeable and needs no extra service. The limits are passed in as parameters, so tuning them is a code change, not a migration.

**Size estimate.** Payloads are capped at 100 options × 200 characters, so a worst-case row is about 25 KB and a typical one is under 2 KB. With 7-day expiry, usage stays far below the free tier's 500 MB database limit.

## 6. Free-tier constraints

Both free tiers fit this feature. These are the limits that affect the design. Check them on Vercel's and Supabase's pricing pages before launch, because providers change them.

| Constraint | Effect | How the design handles it |
|---|---|---|
| **Vercel Hobby is for non-commercial use only** | Adding ads or payments would mean moving to a paid plan | Ads have been removed. Revisit when planning to make money |
| **Vercel Hobby has hard monthly usage caps** | If a huge showcase pushes usage past the cap, the site stops working until the next month, with no surprise bill | The `/c/` page already runs server code on every view, so `/s/` doesn't add any. Cached reads keep database load flat |
| **Vercel Hobby cron runs daily, sometime within the scheduled hour** | Cleanup timing isn't exact | Doesn't matter for a 7-day expiry |
| **Supabase free projects pause after about a week with no activity** | A paused project rejects every request until you restore it in the dashboard | The daily cron calls the database through the API, which should count as activity. Confirm this in Supabase's docs. If the project does pause, creating a card falls back to long links, and no anonymous card could have been visited in that week anyway |
| **Supabase free tier: 2 projects, 500 MB database, no branching** | One production project and one dev project | Section 4.3 |

**Why cleanup runs on Vercel Cron and not `pg_cron`:** Supabase supports `pg_cron`, which could run cleanup inside the database. It runs inside Postgres without going through Supabase's API, though, so it probably doesn't count as activity and wouldn't stop the project pausing. One daily Vercel Cron call does both jobs: cleanup and keeping the project active.

## 7. Dependencies and environment

**npm dependency: one package. Needs your approval before install.**

| Package | Why | Notes |
|---|---|---|
| `@supabase/supabase-js` (pin the current 2.x release) | Server-side Supabase client over HTTPS. The same library is needed for Supabase Auth later | Check the exact version on npm and that the publisher is Supabase before installing |

Nothing else is needed:

- **ID generation and hashing** use `crypto.getRandomValues` and `crypto.subtle.digest`, which are built into the runtime.
- **Caching** uses Next's `unstable_cache` and `after()` (Next 15.5, already installed).
- **Rate limiting and cleanup** use the Postgres functions above.
- **Cron** uses Vercel Cron Jobs, configured in `vercel.json`.

**Environment variables**

| Name | Where | Purpose |
|---|---|---|
| `SUPABASE_URL` | Vercel, `.env.local` | Project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_SECRET_KEY` | Vercel, `.env.local` | Secret API key (`sb_secret_…`, under Project Settings → API Keys). **Server only: it bypasses RLS** |
| `CRON_SECRET` | Vercel | Vercel sends this as a Bearer token on cron requests, and the cleanup route rejects requests without it |
| `IP_HASH_SALT` | Vercel, `.env.local` | Random string mixed into IP hashes so raw IPs are never stored |

None of these may use the `NEXT_PUBLIC_` prefix. That includes `SUPABASE_URL`: no browser code needs it in this phase. User profiles will add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Those two are designed to be public, and the RLS and revoked function access from section 4.2 are what keep them safe. **The secret key must never get the `NEXT_PUBLIC_` prefix.**

**`.gitignore` fix:** the existing `.env*` rule also ignores `.env.example`. Add `!.env.example` below it so the placeholder file can be committed.

## 8. Server code

All Supabase code lives in `src/app/lib/server/` and is imported only from route handlers and server components, never from `"use client"` files.

### 8.1 `supabase.ts`: the client

```ts
import { createClient } from "@supabase/supabase-js";

// Secret key: bypasses RLS, so this module must never reach the browser
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
```

### 8.2 `cardIds.ts`: IDs and hashing

- `generateCardId()` creates 8 base62 characters from `crypto.getRandomValues`. It skips random bytes ≥ 248 so every character is equally likely. That gives 62⁸ ≈ 2.2 × 10¹⁴ possible IDs: collisions are extremely rare and IDs can't be guessed.
- `CARD_ID_PATTERN = /^[0-9A-Za-z]{8}$/`
- `hashCard(card)` returns the SHA-256 hex of `JSON.stringify({ g, o, f, t })`, with keys in a fixed order. Option order is part of the hash, so a reordered card counts as a different card.

### 8.3 `cards.ts`: reading and writing cards

**`createCard(card): Promise<string>`**

```ts
const hash = await hashCard(card);
for (let attempt = 0; attempt < 3; attempt++) {
  const { data, error } = await supabase.rpc("create_card", {
    p_id: generateCardId(),
    p_hash: hash,
    p_payload: card,
  });
  if (error) throw error;
  if (data) return data;
  // null: the random ID collided with an existing card, so try a new one
}
throw new Error("Could not allocate a card ID");
```

A duplicate of a **disabled** card returns the disabled ID. That's intentional: re-creating a card that was taken down still shows the not-found page.

**`getCard(id)`**, wrapped in the data cache:

```ts
export const getCard = (id: string) =>
  unstable_cache(() => selectCard(id), ["card", id], {
    revalidate: 3600,
    tags: [`card:${id}`],
  })();
```

`selectCard` queries `.from("cards").select("payload, disabled").eq("id", id).maybeSingle()` and returns `{ card: CardState, disabled: boolean } | null`, running the payload through `toCardState()`. It doesn't read `last_accessed_at`, so cached data never needs refreshing just because a card was visited. It **throws** on a Supabase error instead of returning `null`. That way an outage doesn't get cached as "card not found" for an hour, and the page shows the error page.

**Why a 1-hour revalidate:** it keeps this phase free of tag-invalidation code. Disabling a card with SQL, or the cron deleting one, shows up on the site within an hour. The cost is about one DB read per card per hour per Vercel region. If moderation needs to take effect immediately, a later admin route can call `revalidateTag("card:<id>")`.

**`touchCard(id)`**, called from `after()` on the card page:

```ts
const DAY_MS = 24 * 60 * 60 * 1000;
const recentlyTouched = new Map<string, number>();

export const touchCard = async (id: string) => {
  const last = recentlyTouched.get(id);
  if (last && Date.now() - last < DAY_MS) return;
  if (recentlyTouched.size > 10_000) recentlyTouched.clear();
  recentlyTouched.set(id, Date.now());

  await supabase.rpc("touch_card", { p_id: id });
};
```

How this behaves during a burst: the `Map` makes each warm serverless instance call `touch_card` at most once per card per day. The function's `WHERE last_accessed_at < now() - interval '1 day'` turns every call after the first into a no-op. So 5,000 viewers spread across, say, 30 instances cause at most 30 cheap calls and only 1 real write, and they run after the response has been sent.

### 8.4 `rateLimit.ts`

```ts
const IP_PER_MINUTE = 10;
const IP_PER_DAY = 100;
const GLOBAL_PER_MINUTE = 300;

// Returns true if the request is allowed
export const checkRateLimit = async (ip: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("check_create_limits", {
    p_ip_key: `ip:${await sha256Hex(process.env.IP_HASH_SALT + ip)}`,
    p_ip_per_minute: IP_PER_MINUTE,
    p_ip_per_day: IP_PER_DAY,
    p_global_per_minute: GLOBAL_PER_MINUTE,
  });
  if (error) throw error;
  return data === true;
};
```

- Raw IPs are never stored. Only the salted hash is, and the cleanup deletes it after 2 days.
- The global limit caps total write load even if an attacker spreads requests across many IPs. Because failed creates fall back to long links (section 10), a real user who hits a limit still gets a working card. They just get the long URL.
- On Vercel the IP comes from the `x-forwarded-for` header (first entry), falling back to `x-real-ip`.

## 9. API: `POST /api/cards`

New file: `src/app/api/cards/route.ts`

**Request**

```json
{ "gridSize": 5, "options": ["..."], "includeFreeSpace": true, "themeKey": "nintendoDirect" }
```

**Handling, in order**

1. **Origin check:** reject with 403 if the `Origin` header isn't `SITE_URL`, or localhost in development. This stops casual cross-site posting. It doesn't stop scripts, which the rate limits handle.
2. **Size cap:** read the body as text and reject anything over 32 KB with 413.
3. **Validate:** parse the JSON and run `toCardState()`, which needs to be exported from `url-helpers.ts`. Also require `options.length >= cells needed`, matching what the client already checks. Invalid input gets 400.
4. **Rate limit:** 429 with a `Retry-After` header.
5. **Create:** `createCard()`, then return **201 `{ "id": "aZ3kP9qX" }`**.
6. **Supabase error (including a paused project):** 503. Log the error, not the payload.

Validation runs before the rate limit so malformed junk never reaches the database.

## 10. Client changes

### 10.1 `CardMaker` ([src/app/components/CardMaker/index.tsx](../../src/app/components/CardMaker/index.tsx))

Change `handleGenerateCard`:

```ts
const card = { includeFreeSpace, themeKey, gridSize, options };
setCreating(true);
try {
  const res = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  const { id } = await res.json();
  router.push(`/s/${id}`);
} catch {
  // Short links are an enhancement: never block card creation on them
  router.push(`/c/${await encodeCard(card)}`);
}
```

- Add a `creating` state. While a create is in progress, the button is disabled and reads "Creating…", so double clicks can't post twice.
- The `generate_card` GTM event stays where it is. Optionally add a `card_link_fallback` event in the `catch` block so you can see in analytics how often fallback happens.

### 10.2 `BingoCard` ([src/app/components/Bingo/index.tsx](../../src/app/components/Bingo/index.tsx))

No changes. The share button already uses `window.location.href`, which is now the short URL.

## 11. Pages

### 11.1 `src/app/s/[id]/page.tsx` (new)

```tsx
export const metadata: Metadata = {
  title: "Bingo Card | Video Game Prediction Bingo",
  robots: { index: false, follow: true },
};

export default async function ShortCardPage({ params }) {
  const { id } = await params;
  if (!CARD_ID_PATTERN.test(id)) notFound();

  const result = await getCard(id);
  if (!result || result.disabled) notFound();

  after(() => touchCard(id));
  return <BingoCard key={id} card={result.card} />;
}
```

Use the same metadata as the `/c/` page, so cards stay out of search results.

### 11.2 `src/app/s/[id]/not-found.tsx` (new)

"We couldn't find this card", explaining that it may have been removed after a period of inactivity or the link may be mistyped, with a "Make a new card" button linking to `/`. The wording stays generic so it doesn't reveal how cards are stored or removed. Use the existing `Backdrop`, `Wordmark` and `Button` components so it matches the rest of the site.

The same page is shown for missing, expired and disabled cards, so the page never reveals that a card was taken down.

### 11.3 `src/app/s/[id]/error.tsx` (new)

If Supabase can't be reached (an outage or a paused project), `getCard` throws. This page says "We couldn't load this card right now, try again in a minute" and has a retry button. It's kept separate from the not-found page so an outage never tells viewers their card is gone.

### 11.4 Existing routes

- `/c/[card]`: unchanged. It still decodes old links and the fallback links.
- `/?s=`: unchanged. It still redirects legacy links to `/c/`.

## 12. Cleanup cron

New file: `src/app/api/cron/cleanup/route.ts`

```ts
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase.rpc("cleanup_expired", {
    p_ttl_days: ANON_CARD_TTL_DAYS,
  });
  if (error) return new Response("Cleanup failed", { status: 500 });

  return Response.json(data); // { cards: n, rate_limits: n }
}
```

New file: `vercel.json`

```json
{
  "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 9 * * *" }]
}
```

- The job runs daily at 09:00 UTC, which is overnight in the Americas and mostly avoids showcase hours.
- Because cleanup runs once a day, a card is actually deleted between 7 and 8 days after its last visit. A visit during that window keeps it alive, which is the intended behavior.
- The same daily call keeps the Supabase project active (section 6).
- **Expiry window as a constant:** put `ANON_CARD_TTL_DAYS = 7` in `src/app/lib/constants.ts` and pass it to the function, so the window has one source of truth.

## 13. Designing ahead for user profiles

Nothing in this section gets built now. It records the agreed rules and shows that the design above supports them with Supabase Auth.

**Agreed rules**

- A card linked to a user is **never** deleted by the 7-day rule.
- A user inactive for **1 year** is deleted, along with all of their cards.

**What's already in place**

| Already built in this phase | What it makes possible later |
|---|---|
| Nullable `cards.owner_id` | Owned cards need no schema change, only a foreign key |
| `cleanup_expired` only touches `owner_id is null` | Owned cards are already excluded from the 7-day rule |
| Partial unique and cleanup indexes `where owner_id is null` | Anonymous and owned cards can have separate dedup rules |
| RLS on, functions revoked from `anon`/`authenticated` | Adding the publishable key to the browser exposes nothing by default. Access is granted one policy at a time |
| `@supabase/supabase-js` | Supabase Auth uses the same library. Auth adds `@supabase/ssr` for session cookies in Next.js |
| `POST /api/cards` route handler | Can read the session and set `owner_id` at insert time |
| Rate limit keyed by a string | Logged-in users can be keyed `user:<id>` with higher limits |

**Migration sketch for that phase**

Supabase Auth stores accounts in `auth.users`, which Supabase manages. App data goes in a `profiles` table that shares the same ID:

```sql
create table public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

alter table public.cards
  add constraint cards_owner_fk
  foreign key (owner_id) references public.profiles(id) on delete cascade;

create unique index cards_owned_content_hash
  on public.cards (owner_id, content_hash) where owner_id is not null;

-- Owners can list their own cards from the browser ("My cards")
create policy "owners read own cards" on public.cards
  for select to authenticated using (owner_id = (select auth.uid()));
```

Deleting a user from `auth.users` cascades to `profiles`, which cascades to `cards`.

**Decisions to make in that phase**

- **Track activity, not logins.** Supabase records `auth.users.last_sign_in_at`, but sessions refresh themselves for months, so a daily user might not "sign in" once a year. Update `profiles.last_active_at` on authenticated requests instead, at most once a day, using the same pattern as `touchCard`.
- **User cleanup.** Extend the daily cron: select profiles with `last_active_at` older than one year, then delete each user with `supabase.auth.admin.deleteUser(id)`. That's Supabase's supported way to remove an account, and the cascades remove their profile and cards. Deleted cards can stay visible for up to an hour, until the cache expires. If that's not acceptable, collect the card IDs first and call `revalidateTag` for each.
- **Claiming anonymous cards.** If someone creates cards and then signs up, they may want those cards to become theirs. Setting `owner_id` on a card moves it out of the anonymous indexes and stops it expiring. If the user already owns a card with the same content, the owned unique index will reject the claim, so that case needs handling.
- **Editing a card.** This phase treats cards as unchangeable, which is what makes the long cache safe. Editing would need `revalidateTag("card:<id>")` after each update. The ID and URL stay the same, so links already shared keep working.
- **Warning emails before deleting an account** (optional), plus a privacy policy update covering account data. Supabase Auth's built-in email sending is heavily rate-limited on the free tier, so production emails will likely need a custom SMTP provider.
- **Sign-in methods** (Twitch OAuth fits a streamer audience well) and the extra dependencies they need. Both need your approval at that point.

## 14. Security and privacy checklist

- [ ] `SUPABASE_SECRET_KEY` is server-only and never `NEXT_PUBLIC_`. `supabase.ts` is never imported by a client component.
- [ ] RLS is enabled on every table. No policies exist in this phase.
- [ ] `EXECUTE` is revoked from `public`, `anon` and `authenticated` on every function.
- [ ] Supabase's security advisor (Dashboard → Advisors) reports no warnings after the migration.
- [ ] Card content is validated on write and again on read with `toCardState()`.
- [ ] Request bodies over 32 KB are rejected before parsing.
- [ ] Origin check, per-IP and global rate limits on create.
- [ ] Raw IPs are never stored, only salted hashes, deleted after 2 days.
- [ ] Card IDs are random and checked against a strict pattern before any query.
- [ ] Disabled, expired and missing cards all look the same to visitors. Outages show a different page.
- [ ] Logs never include card payloads, IP addresses or keys.
- [ ] The cron route requires `CRON_SECRET`.
- [ ] No SQL is built by string concatenation: everything goes through supabase-js parameters or the functions.

## 15. Moderation (this phase)

Run this in the production project's SQL editor:

```sql
update public.cards set disabled = true where id = 'aZ3kP9qX';
```

It takes effect within an hour, when the card's cache entry expires. Disabled cards are then deleted by the cron 7 days after their last visit, because visits to a disabled card don't count as visits (the page returns 404 before `touchCard` runs).

## 16. Implementation steps

Each step can be its own commit, and steps 2–9 can be one PR.

| # | Step | Files | Who |
|---|---|---|---|
| 1 | Create the production and dev Supabase projects. Run the migration in both. Add environment variables to Vercel and `.env.local`. Check the security advisor | Supabase / Vercel dashboards, `.env.local` | You |
| 2 | Add the migration file, `.env.example`, and the `.gitignore` exception | `supabase/migrations/001_cards.sql`, `.env.example`, `.gitignore` | Claude |
| 3 | Install `@supabase/supabase-js` | `package.json`, `package-lock.json` | Claude, after your approval of the exact version |
| 4 | Server library: Supabase client, IDs and hashing, cards, rate limiting. Export `toCardState`. Add `ANON_CARD_TTL_DAYS` | `src/app/lib/server/*`, `src/app/utils/url-helpers.ts`, `src/app/lib/constants.ts` | Claude |
| 5 | `POST /api/cards` | `src/app/api/cards/route.ts` | Claude |
| 6 | Short card page, not-found page, error page | `src/app/s/[id]/page.tsx`, `not-found.tsx`, `error.tsx` | Claude |
| 7 | CardMaker: create through the API, with fallback and loading state | `src/app/components/CardMaker/index.tsx` | Claude |
| 8 | Cleanup cron | `src/app/api/cron/cleanup/route.ts`, `vercel.json` | Claude |
| 9 | Update the README: setup, environment variables, migration, moderation | `README.md` | Claude |
| 10 | Deploy a preview, run the test plan, then deploy to production | Vercel | You |

## 17. Test plan

The repo has no test framework, and adding one is out of scope (it would be another dependency decision). These checks are run by hand against the dev project:

**Create**

- [ ] Creating a card redirects to `/s/<8 chars>`, and the board matches the preview.
- [ ] Creating the same card again returns the same ID.
- [ ] Changing one option gives a new ID.
- [ ] The button shows "Creating…" and ignores double clicks.
- [ ] With `SUPABASE_URL` unset or wrong, creation falls back to a working `/c/...` link.
- [ ] With network throttling set to "Offline" after the page loads, creation falls back to `/c/...`.

**API abuse**

- [ ] An invalid payload gets 400, a body over 32 KB gets 413, a foreign `Origin` gets 403.
- [ ] The 11th create within a minute from one IP gets 429, and the UI falls back to the long link.

**Lockdown**

- [ ] Querying `cards` through the API with the **publishable** key returns no rows, and inserting fails.
- [ ] Calling `create_card` through the API with the publishable key fails with a permission error.

**View**

- [ ] The share button and the address bar both show the short URL.
- [ ] `/s/bad`, `/s/!!!!!!!!`, and an unknown valid-format ID all show the not-found page with a 404 status.
- [ ] With Supabase unreachable and the cache empty, `/s/<id>` shows the error page, not the not-found page.
- [ ] A card disabled in SQL shows the not-found page within an hour.
- [ ] Viewing a card older than a day updates `last_accessed_at` (check in SQL). Viewing it again right away does not.
- [ ] Old `/c/...` and `/?s=...` links still work.

**Cleanup**

- [ ] Set a test card's `last_accessed_at` to 8 days ago, call the cron route with the secret, and confirm the row is gone and the response counts it.
- [ ] Calling the cron route without the secret gets 401.

**Load (optional, on a preview deployment)**

- [ ] Send a few thousand GETs to one `/s/<id>` and confirm in Supabase's API logs that requests to the `cards` table stay in single or low double digits.

## 18. Open decisions

1. **Bot check on create.** It's not in this phase. Rate limits plus the long-link fallback should be enough at launch. If abuse shows up, add Cloudflare Turnstile. Supabase Auth also has built-in support for it, which makes it the natural choice once user profiles exist. It adds a dependency and possibly a cookie-consent question.
2. **Rate limit numbers.** The starting values are in section 8.4. Do you want them tuned for streamers who make many cards during a busy showcase week?
3. **URL path.** This proposal uses `/s/<id>`, which keeps short and encoded links clearly separate. `/c/<id>` would also work, because encoded payloads are always far longer than 8 characters, but one route would then have to handle two formats.
4. **Moderation speed.** Is "takes effect within an hour" acceptable, or do you want a secret-protected admin route that invalidates the cache immediately?
