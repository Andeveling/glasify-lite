import type { NextConfig } from "next";
import "./src/env";

const PRISMA_REGEX = /[\\/]node_modules[\\/]@prisma[\\/]/;

const config: NextConfig = {
  compress: true,
  reactCompiler: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Keep Cache Components disabled until pages are refactored with "use cache" directives
  // Route Segment Config (dynamic = 'force-dynamic') is incompatible with cacheComponents
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
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
