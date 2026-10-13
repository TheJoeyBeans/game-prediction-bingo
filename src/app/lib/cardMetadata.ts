import type { Metadata } from "next";
import type { CardState } from "../utils/url-helpers";
import { getEventForTheme } from "./events";

const DESCRIPTION =
  "Play along with this prediction bingo card: open it, mark squares as the show happens and race your friends to bingo.";

// Link previews for shared cards (/s/ and /c/), using the share image of the card's event.
// Cards stay out of search results
export const cardMetadata = (card: CardState | null, path: string): Metadata => {
  const event = card ? getEventForTheme(card.themeKey) : undefined;
  const title = event ? `${event.name} Bingo Card` : "Bingo Card";
  const image = event ? `/${event.slug}/opengraph-image` : "/opengraph-image";

  return {
    title,
    description: DESCRIPTION,
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description: DESCRIPTION,
      url: path,
      siteName: "Video Game Prediction Bingo",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: DESCRIPTION,
      images: [image],
    },
  };
};
