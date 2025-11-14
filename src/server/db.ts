import { PrismaClient } from "@prisma/client";

/**
 * Creates a Prisma client with query logging in development
 *
 * Features:
 * - Query logging in development mode (via Prisma's built-in logger)
 * - Error logging in all environments
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
      (process.env.NODE_ENV ?? "development") === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Export the db client
// In development, this is extended with performance monitoring
// In production, this is a standard PrismaClient
export const db = (globalForPrisma.prisma ??
  createPrismaClient()) as unknown as PrismaClient;

if ((process.env.NODE_ENV ?? "development") !== "production") {
  globalForPrisma.prisma = db as ReturnType<typeof createPrismaClient>;
}
