import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import BingoCard from "../../components/Bingo";
import { CARD_ID_PATTERN } from "../../lib/server/cardIds";
import { getCard, touchCard } from "../../lib/server/cards";

// Each card is a variation of the home page, so keep them out of search results
export const metadata: Metadata = {
  title: "Bingo Card",
  robots: { index: false, follow: true },
};

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
