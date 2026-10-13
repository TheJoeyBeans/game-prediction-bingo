import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BingoCard from "../../components/Bingo";
import { cardMetadata } from "../../lib/cardMetadata";
import { decodeCard } from "../../utils/url-helpers";

// Link preview with the card's event
export async function generateMetadata({
  params,
}: {
  params: Promise<{ card: string }>;
}): Promise<Metadata> {
  const { card: encoded } = await params;
  return cardMetadata(await decodeCard(encoded), `/c/${encoded}`);
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ card: string }>;
}) {
  const { card: encoded } = await params;
  const card = await decodeCard(encoded);

  if (!card) {
    redirect("/");
  }

  return <BingoCard key={encoded} card={card} />;
}
