import { ANON_CARD_TTL_DAYS } from "../../../lib/constants";
import { scheduledEventDates } from "../../../lib/events";
import { getSupabase } from "../../../lib/server/supabase";

// Vercel Cron calls this daily with "Authorization: Bearer <CRON_SECRET>".
// The call also counts as activity, which keeps the free Supabase project from pausing
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Without a secret set, "Bearer undefined" would be accepted, so refuse outright
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { data, error } = await getSupabase().rpc("cleanup_expired", {
      p_ttl_days: ANON_CARD_TTL_DAYS,
      // Cards for upcoming shows are kept until a week after the show
      p_event_dates: scheduledEventDates(),
    });
    if (error) throw new Error(`cleanup_expired failed: ${error.message}`);
    return Response.json(data);
  } catch (err) {
    console.error(err instanceof Error ? err.message : "Cleanup failed");
    return new Response("Cleanup failed", { status: 500 });
  }
}
