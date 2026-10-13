import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsent from "./components/CookieConsent";
import { SITE_URL } from "./lib/constants";
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
  title: {
    default: "Video Game Prediction Bingo",
    template: "%s | Video Game Bingo",
  },
  description:
    "Create prediction bingo cards for video game conferences like Nintendo Direct, PlayStation State of Play, and Xbox Games Showcase. Make your own video game bingo card now!",
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Video Game Prediction Bingo",
    description:
      "Create and play prediction bingo for video game events like Nintendo Direct, PlayStation State of Play, and Xbox Games Showcase.",
    url: SITE_URL,
    siteName: "Video Game Prediction Bingo",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
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
      </head>
      <body>
        <CookieConsent>{children}</CookieConsent>
        <SpeedInsights />
      </body>
    </html>
  );
}
