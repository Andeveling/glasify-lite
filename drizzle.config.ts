import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env.local or .env.production
// Using dynamic import to avoid issues with .env loading
const dbUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default defineConfig({
  // Schema location - exports all tables from src/server/db/schema.ts
  schema: "./src/server/db/schema.ts",

  // Migration output directory
  out: "./drizzle/migrations",

  // Database dialect
  dialect: "postgresql",

  // Database connection - use DIRECT_URL for Neon pooling
  dbCredentials: {
    url: directUrl || dbUrl,
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
