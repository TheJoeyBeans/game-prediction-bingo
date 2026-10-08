import { redirect } from "next/navigation";
import CardMaker from "./components/CardMaker";
import { decodeLegacyCard, encodeCard } from "./utils/url-helpers";

export default async function BingoHome({
  searchParams,
}: {
  searchParams: Promise<{ s?: string | string[] }>;
}) {
  const { s } = await searchParams;

  // Send links shared before /c/ existed to the new, shorter format
  const legacyCard = typeof s === "string" ? decodeLegacyCard(s) : null;
  if (legacyCard) {
    redirect(`/c/${await encodeCard(legacyCard)}`);
  }

  return <CardMaker />;
}
