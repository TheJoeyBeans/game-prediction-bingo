import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BingoCard from "../../components/Bingo";
import { decodeCard } from "../../utils/url-helpers";

// Each card is a variation of the home page, so keep them out of search results
export const metadata: Metadata = {
  title: "Bingo Card | Video Game Prediction Bingo",
  robots: { index: false, follow: true },
};

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
