-- Keep cards for scheduled events until the event has passed.
-- Run once per Supabase project in the SQL editor, after 001_cards.sql.
--
-- cleanup_expired now also takes the dates of upcoming events, keyed by theme, e.g.
--   {"gameAwards": "2026-12-10"}
-- A card whose theme has a date is kept until p_ttl_days after that date, however long ago
-- it was last opened; after that the usual "p_ttl_days since last opened" rule applies.
-- The new parameter defaults to no dates, so calls made the old way keep working.

drop function public.cleanup_expired(int);

create function public.cleanup_expired(
  p_ttl_days int,
  p_event_dates jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_cutoff timestamptz := now() - make_interval(days => p_ttl_days);
  v_cards int;
  v_limits int;
begin
  delete from cards
  where owner_id is null
    and last_accessed_at < v_cutoff
    and coalesce((p_event_dates ->> (payload ->> 'themeKey'))::timestamptz, '-infinity') < v_cutoff;
  get diagnostics v_cards = row_count;

  delete from rate_limits where window_start < now() - interval '2 days';
  get diagnostics v_limits = row_count;

  return jsonb_build_object('cards', v_cards, 'rate_limits', v_limits);
end;
$$;

-- Only the secret key (service_role) may call this
revoke execute on function public.cleanup_expired(int, jsonb)
from public, anon, authenticated;
