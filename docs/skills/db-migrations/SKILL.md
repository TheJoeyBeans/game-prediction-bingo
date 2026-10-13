---
name: db-migrations
description: Write, review and roll out Supabase database changes for videogamebingo.com, then walk the developer through running and verifying them on the dev and production projects. Use whenever a change needs a new table, column, index, policy or database function, or any change to supabase/migrations.
---

# Database changes for videogamebingo.com

The site uses Supabase Postgres (free tier). There's no migration tool: each change is a numbered SQL file in `supabase/migrations/` that the developer runs by hand in each project's SQL editor. You write the file and the checks; the developer runs everything in Supabase.

Read the existing migrations first, so the new one matches their style.

## The two projects

| Project | Used by |
|---|---|
| `game-prediction-bingo-dev` | Local development (`.env.local`) and Vercel **Preview** deployments |
| `game-prediction-bingo` | Vercel **Production** |

Always dev first. Test data only ever goes into dev.

## Writing the migration

1. **File name:** the next number, then a short description: `003_profiles.sql`. Start with a comment saying what it does and to run it after the previous file.
2. **Every new table gets row-level security turned on** in the same file:
   ```sql
   alter table public.<table> enable row level security;
   ```
   With no policies, the publishable key can't read or write the table; the server's secret key still can. Only add policies when the browser genuinely needs access (for example, once users can list their own cards), and scope them with `(select auth.uid())`.
3. **Every function** gets `set search_path = public`, and access revoked from public users at the end of the file:
   ```sql
   revoke execute on function public.<name>(<arg types>) from public, anon, authenticated;
   ```
4. **Changing a function's arguments** needs `drop function public.<name>(<old arg types>);` then `create function ...` and the `revoke` again. Give new arguments defaults where you can, so code already deployed keeps working.
5. **Deploy order:** decide whether the migration must run before the code that uses it deploys (usually yes) or can run either way, and tell the developer plainly. Getting this wrong breaks production.
6. **No secrets, no real user data** in migration files or test SQL.
7. Server code calls functions with `getSupabase().rpc(...)` and reads tables with `.from(...)`; see `src/app/lib/server/`.

Before handing it over, re-read the file for: RLS on every new table, `search_path` and `revoke` on every function, and correct argument types in each `revoke`.

## Walking the developer through it

Write every step out in full, numbered, with SQL in code blocks and what they should see after each one.

### Step 1: Run it on dev
1. Open the **dev** project in Supabase → **SQL Editor** → **New query**.
2. Paste the full contents of `supabase/migrations/<file>.sql` and click **Run**.
3. They should see "Success. No rows returned". If not, they paste the error to you.

### Step 2: Check tables, security and permissions
Have them run this in the dev SQL editor and paste the result:

```sql
select 'table' as kind, relname as name,
       case when relrowsecurity then 'RLS on' else 'RLS OFF' end as detail
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
union all
select 'policy', tablename || '.' || policyname, cmd || ' to ' || array_to_string(roles, ',')
from pg_policies where schemaname = 'public'
union all
select 'function', p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
       'anon=' || has_function_privilege('anon', p.oid, 'execute')
       || ' authenticated=' || has_function_privilege('authenticated', p.oid, 'execute')
       || ' service_role=' || has_function_privilege('service_role', p.oid, 'execute')
from pg_proc p where p.pronamespace = 'public'::regnamespace
union all
select 'index', indexname, '' from pg_indexes where schemaname = 'public'
order by 1, 2;
```

Before they run it, write out the exact rows you expect. As of migration 002 that's:

| kind | name | detail |
|---|---|---|
| function | check_create_limits(p_ip_key text, p_ip_per_minute integer, p_ip_per_day integer, p_global_per_minute integer) | anon=false authenticated=false service_role=true |
| function | cleanup_expired(p_ttl_days integer, p_event_dates jsonb) | anon=false authenticated=false service_role=true |
| function | create_card(p_id text, p_hash text, p_payload jsonb) | anon=false authenticated=false service_role=true |
| function | touch_card(p_id text) | anon=false authenticated=false service_role=true |
| index | cards_anon_content_hash | |
| index | cards_anon_last_accessed | |
| index | cards_pkey | |
| index | rate_limits_pkey | |
| table | cards | RLS on |
| table | rate_limits | RLS on |

No `policy` rows yet. Every table must say "RLS on", and every function `anon=false authenticated=false service_role=true` unless the migration deliberately grants something.

### Step 3: Security Advisor
In the dev project: **Advisors → Security Advisor**. There should be no errors. Ask them to paste any warnings so you can go through them.

### Step 4: Test it on dev
Write test SQL that exercises the change, as separate statements to run one at a time (the editor only shows the last result). Use `returning` on inserts and updates so they can see what happened, use obvious test IDs like `TEST…`, say the expected result next to each statement, and finish with cleanup SQL.

### Step 5: Run it on production
Only after dev checks out, and at the right point relative to the deploy (see "Deploy order"):
1. Open the **production** project → **SQL Editor** → **New query**.
2. Paste the same file and **Run**: "Success. No rows returned".
3. Run the Step 2 check query again: same expected rows.
4. **Security Advisor**: no errors.
5. **No test inserts in production.**

## After it's live
- If setup changed (for example a new migration to run), update the **Local setup** list in `README.md`.
- If the change affects how cards are kept or deleted, update the operations section of `README.md` and `docs/project-context.md`.
