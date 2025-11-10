import { config } from "dotenv";
import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env.local first, then .env
// Drizzle Studio needs explicit env loading
config({ path: ".env.local" });
config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "DATABASE_URL is not defined in environment variables. " +
      "Make sure .env.local or .env file exists with DATABASE_URL set."
  );
}

export default defineConfig({
  // Schema location - exports all tables from src/server/db/schema.ts
  schema: "./src/server/db/schema.ts",

  // Migration output directory
  out: "./drizzle/migrations",

  // Database dialect
  dialect: "postgresql",

  // Database connection - Supabase uses transaction pooling (port 6543)
  // Only one URL needed (no separate DIRECT_URL like Neon)
  dbCredentials: {
    url: dbUrl,
  },

  // Migration settings
  migrations: {
    // Use timestamp prefix for migrations (e.g., 20250110_143022_initial)
    prefix: "timestamp",
    // Table name where migrations are tracked
    table: "_drizzle_migrations",
    // Schema where migrations table is created
    schema: "public",
  },

  // Verbose logging for debugging
  verbose: true,

  // Strict mode: fail on schema inconsistencies
  strict: true,
}) satisfies Config;
