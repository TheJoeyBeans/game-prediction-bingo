import type { Metadata } from "next";
import CardMaker from "./components/CardMaker";
import JsonLd from "./components/JsonLd";
import { SITE_URL } from "./lib/constants";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Video Game Prediction Bingo",
  url: SITE_URL,
  description:
    "Play bingo with predictions for video game events like Nintendo Direct, State of Play, and Xbox Games Showcase.",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

// Static, so it's served instantly; links from before /c/ existed are redirected by next.config.ts
export default function BingoHome() {
  return (
    <>
      <JsonLd data={structuredData} />
      <CardMaker />
    </>
  );
}
