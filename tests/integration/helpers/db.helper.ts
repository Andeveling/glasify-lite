/**
 * @file Integration Test Database Setup
 * @description Test database utilities for integration tests
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Load test environment variables
config({ path: ".env.test" });
config({ path: ".env.local" });
config({ path: ".env" });

const connectionString =
  process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL_TEST or DATABASE_URL is not defined. Please check your .env files."
  );
}

/**
 * Create a test database client
 * Uses node-postgres with connection pooling
 *
 * @returns Drizzle database client configured for tests
 */
export function createTestDb() {
  const pool = new Pool({
    connectionString,
    max: 10, // Connection pool size
  });

  const db = drizzle({ client: pool, casing: "snake_case" });

  return {
    db,
    pool,
    /**
     * Close database connection
     * Should be called in afterAll() hook
     */
    async close() {
      await pool.end();
    },
  };
}

/**
 * Wait for database to be ready
 * Useful for CI environments
 *
 * @param maxAttempts - Maximum number of connection attempts
 * @param delayMs - Delay between attempts in milliseconds
 */
export async function waitForDb(maxAttempts = 10, delayMs = 1000) {
  const pool = new Pool({ connectionString });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = await pool.connect();
      client.release();
      await pool.end();
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        await pool.end();
        throw new Error(
          `Database not ready after ${maxAttempts} attempts: ${error}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
