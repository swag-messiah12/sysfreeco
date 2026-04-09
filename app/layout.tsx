import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "sysFREEco — Find restaurants that actually know their farmers",
    template: "%s · sysFREEco",
  },
  description:
    "Discover restaurants in Toronto, Hamilton, and the GTA that source independently — not from Sysco or big-box distributors.",
  keywords: ["farm to table Toronto", "local sourcing restaurant", "non-Sysco restaurant", "independent restaurant GTA"],
  openGraph: {
    type: "website",
    title: "sysFREEco",
    description: "Discover restaurants that source independently in Toronto & the GTA.",
    siteName: "sysFREEco",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
