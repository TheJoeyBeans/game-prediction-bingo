import type { Metadata } from "next";
import CardMaker from "./components/CardMaker";
import EventLinks from "./components/EventLinks";
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
      <CardMaker>
        <section className="mt-16 sm:mt-24">
          <h2 className="font-display text-2xl font-bold tracking-tight text-mist-100 sm:text-3xl">
            Bingo for every showcase
          </h2>
          <p className="mt-3 max-w-2xl text-mist-300">
            Each showcase has its own card maker with starter predictions, so
            you can have a card ready before the stream starts.
          </p>
          <div className="mt-6">
            <EventLinks />
          </div>
        </section>
      </CardMaker>
    </>
  );
}
