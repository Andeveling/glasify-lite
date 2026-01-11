import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/generated/client";
import ws from "ws";

// Configure WebSocket for local development (Neon requires WebSocket)
if (process.env.NODE_ENV !== "production") {
  neonConfig.webSocketConstructor = ws;
}

/**
 * Creates a Prisma client with Neon adapter for serverless environments (Prisma v7)
 *
 * Features:
 * - Neon serverless driver with WebSocket support
 * - Connection pooling optimized for serverless (Vercel)
 * - Query logging in development mode
 * - Error logging in all environments
 *
 * Connection Pool Settings (Neon Best Practices for Vercel):
 * - connectionTimeoutMillis: 5000ms (matches Prisma v6 default)
 * - idleTimeoutMillis: 30000ms (30s idle timeout)
 * - max: 1 (Vercel serverless best practice - 1 connection per function invocation)
 *
 * NOTE: Slow query monitoring was removed because:
 * - Winston logger uses headers() internally (incompatible with "use cache")
 * - console is disabled by Biome linting rules
 * - This client is used in pre-rendered routes (/catalog/[modelId])
 * - Prisma's built-in query logging is sufficient for development debugging
 *
 * @see https://neon.tech/docs/guides/prisma
 * @see https://www.prisma.io/docs/orm/overview/databases/neon
 * @see https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
 * @returns Configured PrismaClient instance with Neon adapter
 */
const createPrismaClient = () => {
  // Neon adapter configuration (passes config directly, not pool instance)
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000, // 5s connection timeout (Prisma v6 default)
    idleTimeoutMillis: 30_000, // 30s idle timeout
    max: 1, // Vercel serverless: 1 connection per function
  });

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Log successful connection in development
  if (process.env.NODE_ENV === "development") {
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.log("[Prisma] Client created with Neon adapter (Prisma v7)");
  }

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Singleton pattern: reuse client across hot reloads in development
// In production (serverless), each invocation creates a new client (expected behavior)
export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

// Store client in global scope to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
