import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Conference Bingo",
  description: "Play bingo with your predictions to various game conferences!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
