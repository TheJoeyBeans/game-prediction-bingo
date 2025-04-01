import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Game Prediction Bingo",
  description:
    "Create prediction bingo cards for video game conferences like Nintendo Direct, PlayStation State of Play, and Xbox Games Showcase. Make your own video game bingo card now!",
  keywords: [
    "Nintendo Direct Bingo Card",
    "Nintendo Direct Bingo",
    "Nintendo Direct Bingo Card Maker",
    "Nintendo Direct Prediction Bingo",
    "Nintendo Direct Prediction Bingo Card",
    "Nintendo Direct Prediction Bingo Card Maker",
    "PlayStation State of Play Bingo Card",
    "PlayStation State of Play Bingo",
    "PlayStation State of Play Bingo Card Maker",
    "PlayStation State of Play Prediction Bingo",
    "PlayStation State of Play Prediction Bingo Card",
    "PlayStation State of Play Prediction Bingo Card Maker",
    "Xbox Games Showcase Bingo Card",
    "Xbox Games Showcase Bingo",
    "Xbox Games Showcase Bingo Card Maker",
    "Xbox Games Showcase Prediction Bingo",
    "Xbox Games Showcase Prediction Bingo Card",
    "Xbox Games Showcase Prediction Bingo Card Maker",
    "Video Game Conference Bingo",
    "Video Game Conference Bingo Card",
    "Video Game Conference Bingo Card Maker",
    "Video Game Conference Prediction Bingo",
    "Video Game Conference Prediction Bingo Card",
    "Video Game Conference Prediction Bingo Card Maker",
    "Video Game Prediction Bingo",
    "Video Game Prediction Bingo Card",
    "Video Game Prediction Bingo Card Maker",
    "Video Game Prediction Bingo Card Maker",
    "Video Game Bingo Card",
    "Video Game Bingo",
    "Video Game Bingo Card Maker",
    "Video Game Prediction Bingo Card",
    "Video Game Prediction Bingo Card Maker",
    "Video Game Prediction Bingo Card Maker",
    "Video Game Conference Bingo Card",
    "Video Game Conference Bingo Card Maker",
    "Video Game Conference Prediction Bingo",
    "Video Game Conference Prediction Bingo Card",
    "Video Game Conference Prediction Bingo Card Maker",
    "Prediction Bingo Game",
    "Game Conference Bingo",
  ],
  openGraph: {
    title: "Video Game Predicition Bingo",
    description:
      "Create and play prediction bingo for video game events like Nintendo Direct, PlayStation State of Play, and Xbox Games Showcase.",
    url: "https://your-bingo-app.com",
    siteName: "Video Game Predicition Bingo",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Game Prediction Bingo Logo",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="keywords"
          content="Nintendo Direct Bingo Card, Nintendo Direct Bingo, Nintendo Direct Bingo Card Maker, Nintendo Direct Prediction Bingo, Nintendo Direct Prediction Bingo Card, Nintendo Direct Prediction Bingo Card Maker, PlayStation State of Play Bingo Card, PlayStation State of Play Bingo, PlayStation State of Play Bingo Card Maker, PlayStation State of Play Prediction Bingo, PlayStation State of Play Prediction Bingo Card, PlayStation State of Play Prediction Bingo Card Maker, Xbox Games Showcase Bingo Card, Xbox Games Showcase Bingo, Xbox Games Showcase Bingo Card Maker, Xbox Games Showcase Prediction Bingo, Xbox Games Showcase Prediction Bingo Card, Xbox Games Showcase Prediction Bingo Card Maker, Video Game Conference Bingo, Video Game Conference Bingo Card, Video Game Conference Bingo Card Maker, Video Game Conference Prediction Bingo, Video Game Conference Prediction Bingo Card, Video Game Conference Prediction Bingo Card Maker, Video Game Prediction Bingo, Video Game Prediction Bingo Card, Video Game Prediction Bingo Card Maker, Video Game Prediction Bingo Card Maker, Video Game Bingo Card, Video Game Bingo, Video Game Bingo Card Maker, Video Game Prediction Bingo Card, Video Game Prediction Bingo Card Maker, Video Game Prediction Bingo Card Maker, Video Game Conference Bingo Card, Video Game Conference Bingo Card Maker, Video Game Conference Prediction Bingo, Video Game Conference Prediction Bingo Card, Video Game Conference Prediction Bingo Card Maker, Prediction Bingo Game, Game Conference Bingo"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://videogamebingo.com" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Video Game Prediction Bingo",
              url: "https://videogamebingo.com",
              description:
                "Play bingo with predictions for video game events like Nintendo Direct, State of Play, and Xbox Games Showcase.",
              keywords: [
                "Nintendo Direct Bingo Card",
                "Nintendo Direct Bingo",
                "Nintendo Direct Bingo Card Maker",
                "Nintendo Direct Prediction Bingo",
                "Nintendo Direct Prediction Bingo Card",
                "Nintendo Direct Prediction Bingo Card Maker",
                "PlayStation State of Play Bingo Card",
                "PlayStation State of Play Bingo",
                "PlayStation State of Play Bingo Card Maker",
                "PlayStation State of Play Prediction Bingo",
                "PlayStation State of Play Prediction Bingo Card",
                "PlayStation State of Play Prediction Bingo Card Maker",
                "Xbox Games Showcase Bingo Card",
                "Xbox Games Showcase Bingo",
                "Xbox Games Showcase Bingo Card Maker",
                "Xbox Games Showcase Prediction Bingo",
                "Xbox Games Showcase Prediction Bingo Card",
                "Xbox Games Showcase Prediction Bingo Card Maker",
                "Video Game Conference Bingo",
                "Video Game Conference Bingo Card",
                "Video Game Conference Bingo Card Maker",
                "Video Game Conference Prediction Bingo",
                "Video Game Conference Prediction Bingo Card",
                "Video Game Conference Prediction Bingo Card Maker",
                "Video Game Prediction Bingo",
                "Video Game Prediction Bingo Card",
                "Video Game Prediction Bingo Card Maker",
                "Video Game Prediction Bingo Card Maker",
                "Video Game Bingo Card",
                "Video Game Bingo",
                "Video Game Bingo Card Maker",
                "Video Game Prediction Bingo Card",
                "Video Game Prediction Bingo Card Maker",
                "Video Game Prediction Bingo Card Maker",
                "Video Game Conference Bingo Card",
                "Video Game Conference Bingo Card Maker",
                "Video Game Conference Prediction Bingo",
                "Video Game Conference Prediction Bingo Card",
                "Video Game Conference Prediction Bingo Card Maker",
                "Prediction Bingo Game",
                "Game Conference Bingo",
              ],
            }),
          }}
        />
      </head>
      <SpeedInsights />
      <body>{children}</body>
    </html>
  );
}
