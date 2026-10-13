import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import BingoCard from "../../components/Bingo";
import { cardMetadata } from "../../lib/cardMetadata";
import { CARD_ID_PATTERN } from "../../lib/server/cardIds";
import { getCard, touchCard } from "../../lib/server/cards";

// Link preview with the card's event; a lookup failure just falls back to the generic preview
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const path = `/s/${id}`;
  if (!CARD_ID_PATTERN.test(id)) return cardMetadata(null, path);
  try {
    const stored = await getCard(id);
    return cardMetadata(stored && !stored.disabled ? stored.card : null, path);
  } catch {
    return cardMetadata(null, path);
  }
}

export default async function ShortCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!CARD_ID_PATTERN.test(id)) notFound();

  // Missing and disabled cards look the same, so a takedown is never revealed
  const stored = await getCard(id);
  if (!stored || stored.disabled) notFound();

  // Record the visit after responding, so viewers never wait on the write
  after(() => touchCard(id));

  return <BingoCard key={id} card={stored.card} />;
}
