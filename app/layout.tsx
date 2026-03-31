import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

// Fallback pixel font — loaded only if ChicagoFLF.ttf is missing from /public/fonts/
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio — Mac OS 1",
  description: "A retro Macintosh 128K portfolio experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable} h-full`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
