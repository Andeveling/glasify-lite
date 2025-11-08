import type { NextConfig } from "next";
import "./src/env.js";

const PRISMA_REGEX = /[\\/]node_modules[\\/]@prisma[\\/]/;

const config: NextConfig = {
  compress: true,
  reactCompiler: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable Cache Components temporarily to allow build without database
  // Re-enable after deployment when DATABASE_URL is available
  cacheComponents: false,
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

  // Configure external packages for serverless
  serverExternalPackages: ["@prisma/client"],

  // Turbopack configuration
  turbopack: {
    rules: {
      "*.svg": ["@svgr/webpack"],
    },
  },

  // Webpack optimizations
  webpack: (webpackConfig, { dev, isServer }) => {
    const isProduction = dev === false && isServer === false;
    if (isProduction) {
      webpackConfig.optimization.splitChunks.cacheGroups = {
        ...webpackConfig.optimization.splitChunks.cacheGroups,
        prisma: {
          chunks: "all",
          name: "prisma",
          priority: 20,
          test: PRISMA_REGEX,
        },
      };
    }
    return webpackConfig;
  },
};

export default config;
