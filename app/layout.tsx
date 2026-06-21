import type { Metadata } from "next";
import { Playfair_Display, Noto_Serif_JP, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = "https://tokushoho-generator.vercel.app";

export const metadata: Metadata = {
  title: "特商法 Generator — Official Disclosure Page for Foreign SaaS in Japan",
  description:
    "Generate a legally-required 特定商取引法に基づく表記 (Specified Commercial Transactions Act disclosure) for your SaaS in 60 seconds. English UI → Japanese output. Free, client-side, no signup.",
  metadataBase: new URL(SITE_URL),
  keywords: [
    "特商法 generator",
    "tokushoho page",
    "特定商取引法に基づく表記",
    "Japan SaaS legal requirement",
    "Japan commercial disclosure",
    "tokushoho generator foreign founder",
    "特商法 英語",
  ],
  openGraph: {
    title: "特商法 Generator — Official Disclosure for Foreign SaaS",
    description:
      "The legally-required Japanese commercial disclosure page, generated in 60 seconds. English UI → Japanese output.",
    type: "website",
    url: SITE_URL,
    siteName: "特商法 Generator",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "特商法 Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "特商法 Generator — Japan Disclosure for Foreign SaaS",
    description: "Generate your 特定商取引法 page in 60 seconds. English UI → Japanese output. Free.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${notoSerifJP.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
