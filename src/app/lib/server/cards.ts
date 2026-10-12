import { unstable_cache } from "next/cache";
import { toCardState, type CardState } from "../../utils/url-helpers";
import { generateCardId, hashCard } from "./cardIds";
import { getSupabase } from "./supabase";

const MAX_ID_ATTEMPTS = 3;
const CACHE_SECONDS = 60 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface StoredCard {
  card: CardState;
  disabled: boolean;
}

// Returns the new card's id, or the existing id when the same card was already created
export const createCard = async (card: CardState): Promise<string> => {
  const hash = await hashCard(card);

  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    const { data, error } = await getSupabase().rpc("create_card", {
      p_id: generateCardId(),
      p_hash: hash,
      p_payload: card,
    });
    if (error) throw new Error(`create_card failed: ${error.message}`);
    // null means the random id collided with another card, so try a new one
    if (data) return data;
  }

  throw new Error("Could not allocate a card id");
};

const selectCard = async (id: string): Promise<StoredCard | null> => {
  const { data, error } = await getSupabase()
    .from("cards")
    .select("payload, disabled")
    .eq("id", id)
    .maybeSingle();
  // Throw rather than return null, so an outage is never cached as "card not found"
  if (error) throw new Error(`Card lookup failed: ${error.message}`);
  if (!data) return null;

  // Validate stored cards too, so an outdated or bad row shows as expired instead of crashing
  const { gridSize, options, includeFreeSpace, themeKey } = data.payload ?? {};
  const card = toCardState(gridSize, options, includeFreeSpace, themeKey);
  return card && { card, disabled: data.disabled };
};

// Cards never change, so a burst of viewers shares one cached read. The hour bounds how long
// a disabled or deleted card can still be seen
export const getCard = (id: string) =>
  unstable_cache(() => selectCard(id), ["card", id], {
    revalidate: CACHE_SECONDS,
    tags: [`card:${id}`],
  })();

const recentlyTouched = new Map<string, number>();

// Keeps a card from expiring. Each server instance calls the database at most once a day per card,
// and touch_card itself only writes when the last visit is over a day old
export const touchCard = async (id: string) => {
  const last = recentlyTouched.get(id);
  if (last && Date.now() - last < DAY_MS) return;
  if (recentlyTouched.size > 10_000) recentlyTouched.clear();
  recentlyTouched.set(id, Date.now());

  const { error } = await getSupabase().rpc("touch_card", { p_id: id });
  if (error) {
    recentlyTouched.delete(id);
    console.error(`touch_card failed: ${error.message}`);
  }
};
