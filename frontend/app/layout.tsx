import type { Metadata } from "next";
import { AppShell } from "@/components/layout";
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
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
