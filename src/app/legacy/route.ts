import { NextResponse, type NextRequest } from "next/server";
import { decodeLegacyCard, encodeCard } from "../utils/url-helpers";

// Links shared before /c/ existed (/?s=...) arrive here via next.config.ts, which keeps
// the home page static. Converts them to the current /c/ format, or goes home if unreadable
export async function GET(request: NextRequest) {
  const s = request.nextUrl.searchParams.get("s");
  const card = s ? decodeLegacyCard(s) : null;
  const target = card ? `/c/${await encodeCard(card)}` : "/";
  return NextResponse.redirect(new URL(target, request.url));
}
