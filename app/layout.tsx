import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/**
 * DM Sans is vendored in app/fonts/dm-sans (SIL OFL, see LICENSE.txt)
 * rather than fetched from Google Fonts at build time. The app must build
 * offline; Nigerian connectivity is also the reason the font is self-hosted.
 */
const dmSans = localFont({
  src: [
    {
      path: "./fonts/dm-sans/dm-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans/dm-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans/dm-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans/dm-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ajudar — verified artisans, agreed prices",
  description:
    "Find verified artisans across Nigeria, agree a bounded price, and pay through escrow.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#F7F4EF",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-NG"
      className={`${dmSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
