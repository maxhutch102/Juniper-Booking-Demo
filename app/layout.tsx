import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://salon-demo.pixel-hutch.com"),
  title: {
    default: "Juniper Studio | Salon Booking System Demo",
    template: "%s | Juniper Studio",
  },
  description: "Explore a fictional salon website, live appointment booking flow, stylist workspace, and owner business center built by Pixel Hutch.",
  keywords: ["salon booking system demo", "appointment booking software", "salon business management", "Pixel Hutch"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Juniper Studio | Pixel Hutch Booking Demo",
    description: "Try the customer booking experience and business tools in this fictional salon demo.",
    type: "website",
    locale: "en_US",
    siteName: "Juniper Studio",
  },
  twitter: { card: "summary_large_image" },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
