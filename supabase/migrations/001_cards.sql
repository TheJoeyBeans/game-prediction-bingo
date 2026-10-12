-- Short card URLs: cards keyed by an 8-char id, plus rate-limit counters for creating them.
-- Run once per Supabase project in the SQL editor. See docs/proposals/short-card-urls.md.

-- ────────────────────────────── Tables ──────────────────────────────

create table public.cards (
  id                text        primary key,               -- 8-char base62
  content_hash      text        not null,                  -- sha-256 hex of normalized payload
  payload           jsonb       not null,                  -- { gridSize, options, includeFreeSpace, themeKey }
  owner_id          uuid        null,                      -- always null until user profiles; FK added then
  created_at        timestamptz not null default now(),
  last_accessed_at  timestamptz not null default now(),
  disabled          boolean     not null default false
);

-- Dedup for anonymous cards: the same card content returns the same id
create unique index cards_anon_content_hash
  on public.cards (content_hash) where owner_id is null;

-- Lets cleanup find expired anonymous cards quickly
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

  -- Same content already exists: reuse it and restart its expiry clock
  update cards
  set last_accessed_at = now()
  where content_hash = p_hash and owner_id is null
  returning id into v_id;

  return v_id;
end;
$$;

-- Records a visit at most once a day, so bursts of viewers cause one real write
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

-- Deletes anonymous cards nobody has opened in p_ttl_days, and old rate-limit rows
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
