import { PrismaClient } from "@prisma/client";

import logger from "@/lib/logger";

/**
 * Performance threshold for slow query logging (milliseconds)
 * Queries exceeding this duration will be logged with WARNING level
 */
const SLOW_QUERY_THRESHOLD_MS = 500;

/**
 * Creates a Prisma client with performance monitoring and slow query logging
 *
 * Features:
 * - Query logging in development mode
 * - Slow query detection (>500ms) with Winston logging
 * - Query duration tracking for performance profiling
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

  // Performance monitoring: Log slow queries for optimization (development only)
  if ((process.env.NODE_ENV ?? "development") !== "production") {
    return client.$extends({
      name: "slowQueryLogger",
      query: {
        async $allOperations({ operation, model, args, query }) {
          // Use performance.now() instead of Date.now() for better compatibility with Cache Components
          // performance.now() is a high-resolution timer that doesn't trigger prerendering issues
          const startTime = performance.now();
          const result = await query(args);
          const duration = performance.now() - startTime;

          // Log slow queries for performance analysis
          if (duration > SLOW_QUERY_THRESHOLD_MS) {
            logger.warn("Slow query detected", {
              args: JSON.stringify(args),
              duration: `${duration.toFixed(2)}ms`,
              model,
              operation,
              threshold: `${SLOW_QUERY_THRESHOLD_MS}ms`,
            });
          }

          return result;
        },
      },
    });
  }

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
