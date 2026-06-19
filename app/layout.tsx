import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "特商法ページ Generator — Tokushoho Page for Foreign SaaS",
  description:
    "Free tool: generate a 特定商取引法に基づく表記 (Japanese commercial disclosure) page for your SaaS in seconds. Required for selling online in Japan.",
  keywords: [
    "特商法 generator",
    "tokushoho page",
    "特定商取引法に基づく表記",
    "Japan commercial disclosure",
    "Japan SaaS legal",
    "tokushoho generator",
  ],
  openGraph: {
    title: "特商法ページ Generator — Tokushoho Page for Foreign SaaS",
    description:
      "Generate the required Japanese commercial disclosure page (特商法) for your SaaS in seconds. Free, instant, no signup.",
    type: "website",
    url: "https://tokushoho-generator.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
