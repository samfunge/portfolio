import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows importing SVG as React components via @svgr/webpack would need plugin,
  // but for now we use inline SVG in components.

  // Vercel deployment optimizations
  output: "standalone",

  // Ensure sound files in /public are served correctly
  // (Next.js serves /public/* statically by default — no config needed)
};

export default nextConfig;
