import { PrismaClient } from "@prisma/client";

/**
 * Creates a Prisma client with query logging in development
 *
 * Features:
 * - Query logging in development mode (via Prisma's built-in logger)
 * - Error logging in all environments
 * - Connection pooling optimized for serverless (Vercel)
 *
 * NOTE: Slow query monitoring was removed because:
 * - Winston logger uses headers() internally (incompatible with "use cache")
 * - console is disabled by Biome linting rules
 * - This client is used in pre-rendered routes (/catalog/[modelId])
 * - Prisma's built-in query logging is sufficient for development debugging
 *
 * @returns Configured PrismaClient instance
 */
const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Log successful connection in development
  if (process.env.NODE_ENV === "development") {
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.log("[Prisma] Client created successfully");
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
