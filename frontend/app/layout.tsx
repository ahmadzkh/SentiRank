import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DataProvider } from "@/lib/data-cache";

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
      <body>
        <DataProvider>{children}</DataProvider>
        <Analytics />
      </body>
    </html>
  );
}
