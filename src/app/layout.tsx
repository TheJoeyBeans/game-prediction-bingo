import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsent from "./components/CookieConsent";
import { KEYWORDS, SITE_URL } from "./lib/constants";
import { CONSENT_DEFAULTS_SCRIPT } from "./lib/consent";
import "./globals.css";

// next/font bundles these with the site, so visitors' browsers never contact Google Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const viewport: Viewport = {
  themeColor: "#07080d",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Video Game Prediction Bingo",
  description:
    "Create prediction bingo cards for video game conferences like Nintendo Direct, PlayStation State of Play, and Xbox Games Showcase. Make your own video game bingo card now!",
  keywords: KEYWORDS,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Video Game Prediction Bingo",
    description:
      "Create and play prediction bingo for video game events like Nintendo Direct, PlayStation State of Play, and Xbox Games Showcase.",
    url: SITE_URL,
    siteName: "Video Game Prediction Bingo",
    // TODO: replace with a 1200x630 share image
    images: [{ url: "/favicon.ico", alt: "Game Prediction Bingo Logo" }],
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Video Game Prediction Bingo",
  url: SITE_URL,
  description:
    "Play bingo with predictions for video game events like Nintendo Direct, State of Play, and Xbox Games Showcase.",
  keywords: KEYWORDS,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <CookieConsent>{children}</CookieConsent>
        <SpeedInsights />
      </body>
    </html>
  );
}
