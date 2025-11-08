import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { env } from "@/env";


const { DATABASE_URL, PRISMA_CONNECTION_LIMIT } = env;
// Configure Neon WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

/**
 * Creates a Prisma client with Neon adapter and query logging in development
 *
 * Features:
 * - Neon WebSocket adapter for optimized serverless connections
 * - Query logging in development mode (via Prisma's built-in logger)
 * - Error logging in all environments
 *
 * NOTE: Slow query monitoring was removed because:
 * - Winston logger uses headers() internally (incompatible with "use cache")
 * - console is disabled by Biome linting rules
 * - This client is used in pre-rendered routes (/catalog/[modelId])
 * - Prisma's built-in query logging is sufficient for development debugging
 *
 * @returns Configured PrismaClient instance with Neon adapter
 */
const createPrismaClient = () => {
  const connectionString = DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Limit connections during build to prevent Neon "too many connections" errors
  // Neon Free Tier: max 1 connection, Paid: adjust based on your plan
  const connectionLimit = PRISMA_CONNECTION_LIMIT 
    ? `?connection_limit=${PRISMA_CONNECTION_LIMIT}`
    : "";
  
  const finalConnectionString = connectionString.includes("?")
    ? connectionString // Already has query params
    : `${connectionString}${connectionLimit}`;

  // Create Neon adapter for serverless connections
  const adapter = new PrismaNeon({ connectionString: finalConnectionString });

  const client = new PrismaClient({
    adapter,
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

// Export the db client with proper type inference
// The type is inferred from createPrismaClient(), which includes all generated models
export const db = globalForPrisma.prisma ?? createPrismaClient();

if ((process.env.NODE_ENV ?? "development") !== "production") {
  globalForPrisma.prisma = db;
}
