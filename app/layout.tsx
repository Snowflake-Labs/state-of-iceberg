import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The State of Iceberg",
  description:
    "An interactive explorer of Apache Iceberg interoperability across the modern data ecosystem. Discover which platforms, engines, and catalogs can connect — and how.",
  openGraph: {
    title: "The State of Iceberg",
    description:
      "Explore Apache Iceberg interoperability across 30+ platforms, engines, and catalogs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
