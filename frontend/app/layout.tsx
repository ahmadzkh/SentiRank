import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentiRank",
  description:
    "Dashboard analitik penelitian untuk analisis sentimen ulasan Spotify dan prioritas insight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
