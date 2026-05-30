import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentiRank",
  description:
    "Research analytics dashboard for Spotify review sentiment analysis and insight prioritization.",
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
