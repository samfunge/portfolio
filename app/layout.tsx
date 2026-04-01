import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import PostHogProvider from "@/components/providers/PostHogProvider";
import AudioProvider from "@/components/providers/AudioProvider";
import AnimatedFavicon from "@/components/os/AnimatedFavicon";

// Fallback pixel font — used only when ChicagoFLF.ttf is absent from /public/fonts/.
// The CSS @font-face in globals.css references ChicagoFLF first; this variable
// makes Press Start 2P available as `--font-press-start` for the cascade fallback.
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samuel Funge",
  description: "A retro Macintosh 128K portfolio experience",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable} h-full`}>
      {/*
        PostHogProvider wraps the whole tree so every Client Component can call
        usePostHog() without prop-drilling.

        AudioProvider wraps below so it can safely use browser APIs via Client
        Components — it is itself a 'use client' boundary.
      */}
      <body className="h-full overflow-hidden">
        <AnimatedFavicon />
        <PostHogProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
