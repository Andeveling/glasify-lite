import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/generated/client";

/**
 * Creates a Prisma client with libsql adapter for SQLite databases
 *
 * Features:
 * - Embedded SQLite database (zero infrastructure)
 * - libsql is a SQLite-compatible database (fork of SQLite)
 * - Perfect for 1-3 concurrent users
 * - File-based persistence in ./prisma/dev.db
 *
 * @see https://www.prisma.io/docs/orm/overview/databases/sqlite
 * @see https://github.com/tursodatabase/libsql
 * @returns Configured PrismaClient instance with libsql adapter
 */
const createPrismaClient = () => {
  // SQLite database file path (file:./prisma/dev.db or DATABASE_URL env)
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  // Create Prisma adapter with libsql config
  const adapter = new PrismaLibSql({ url: dbUrl });

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
    console.log("[Prisma] Client created with libsql adapter");
  }

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Singleton pattern: reuse client across hot reloads in development
export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

// Store client in global scope to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
