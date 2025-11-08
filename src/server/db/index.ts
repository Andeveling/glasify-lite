import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof drizzle> | undefined;
}

/**
 * Initialize Drizzle ORM database client
 *
 * For development: Reuses connection pool with hot reload support
 * For production: Single connection pool instance
 *
 * Uses DATABASE_URL for pooled connections (Neon SQL)
 * Uses DIRECT_URL for migrations (bypasses Neon connection pooling)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // DIRECT_URL bypasses Neon pooling for migrations
  directUrl: process.env.DIRECT_URL,
  // Connection pool settings
  max: 10, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Prevent connection pool exhaustion in development
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const db =
  global.db ||
  drizzle(pool, {
    schema,
    // Enable logging in development
    logger: process.env.NODE_ENV === 'development',
  });

// Singleton pattern for development hot-reload
if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}

export { db };

// Export schema for type inference
export * from './schema';
