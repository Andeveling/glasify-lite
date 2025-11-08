import type { Config } from 'drizzle-kit';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .env.local or .env.production
// Using dynamic import to avoid issues with .env loading
const dbUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export default defineConfig({
  // Schema location
  schema: './src/server/db/schema.ts',

  // Migration output directory
  out: './drizzle/migrations',

  // Database dialect
  dialect: 'postgresql',

  // Database connection
  dbCredentials: {
    url: dbUrl,
    // DIRECT_URL is used for migrations with Neon (bypass pooling)
    directUrl: directUrl,
  },

  // Migration settings
  migrations: {
    // Use timestamp prefix for migrations (e.g., 20250110_143022_initial)
    prefix: 'timestamp',
    // Table name where migrations are tracked
    table: '_drizzle_migrations',
    // Schema where migrations table is created
    schema: 'public',
  },

  // Verbose logging for debugging
  verbose: process.env.NODE_ENV !== 'production',

  // Strict mode: fail on schema inconsistencies
  strict: true,
}) satisfies Config;
