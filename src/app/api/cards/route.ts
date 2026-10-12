import { toCardState } from "../../utils/url-helpers";
import { createCard } from "../../lib/server/cards";
import { checkRateLimit } from "../../lib/server/rateLimit";

const MAX_BODY_BYTES = 32 * 1024;
const RETRY_AFTER_SECONDS = 60;

const error = (status: number, message: string, headers?: HeadersInit) =>
  Response.json({ error: message }, { status, headers });

// Same-origin check by host, so it works on localhost, preview deployments and production alike
const isSameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
};

// Vercel puts the client IP first in x-forwarded-for
const getClientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return error(403, "Forbidden");

  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return error(413, "Card is too large");
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return error(413, "Card is too large");
  }

  let card;
  try {
    const { gridSize, options, includeFreeSpace, themeKey } = JSON.parse(body);
    card = toCardState(gridSize, options, includeFreeSpace, themeKey);
  } catch {
    return error(400, "Invalid card");
  }
  // Same rule as the card maker: enough predictions to fill every cell
  const cells = card ? card.gridSize ** 2 - (card.includeFreeSpace ? 1 : 0) : 0;
  if (!card || card.options.length < cells) return error(400, "Invalid card");

  try {
    if (!(await checkRateLimit(getClientIp(request)))) {
      return error(429, "Too many cards, try again in a minute", {
        "Retry-After": String(RETRY_AFTER_SECONDS),
      });
    }
    const id = await createCard(card);
    return Response.json({ id }, { status: 201 });
  } catch (err) {
    // Log the failure, never the card or the IP
    console.error(err instanceof Error ? err.message : "Card creation failed");
    return error(503, "Couldn't save the card right now");
  }
}
