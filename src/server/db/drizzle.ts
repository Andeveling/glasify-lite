import { config } from "dotenv";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined. Please check your .env.local file."
  );
}

// Detect if we're using local Neon (localhost) or cloud Neon
const isLocalNeon = connectionString.includes("localhost");

/**
 * Drizzle ORM database client
 * - Uses node-postgres for local Neon development
 * - Uses neon-http for cloud Neon (serverless)
 */
export const db = await (async () => {
  if (isLocalNeon) {
    // Local Neon: use node-postgres
    const { drizzle: drizzleNodePg } = await import(
      "drizzle-orm/node-postgres"
    );
    const { Pool } = await import("pg");

    const pool = new Pool({ connectionString });
    return drizzleNodePg({ client: pool, casing: "snake_case" });
  }

  // Cloud Neon: use neon-http (serverless)
  const { drizzle: drizzleNeonHttp } = await import("drizzle-orm/neon-http");
  const { neon } = await import("@neondatabase/serverless");

  const sql = neon(connectionString);
  return drizzleNeonHttp({ client: sql, casing: "snake_case" });
})();
