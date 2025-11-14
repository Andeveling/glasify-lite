import type { NextConfig } from "next";
import "./src/env";

const config: NextConfig = {
  compress: true,
  reactCompiler: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable Cache Components temporarily to allow build without database
  // Re-enable after deployment when DATABASE_URL is available
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Security headers
  headers() {
    return Promise.resolve([
      {
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
        source: "/(.*)",
      },
    ]);
  },

  // Image optimization for Vercel
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        pathname: "/photo-*/**",
        protocol: "https",
      },
    ],
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      "*.svg": ["@svgr/webpack"],
    },
  },
};

export default config;
