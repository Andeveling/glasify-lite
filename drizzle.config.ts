import { config } from "dotenv";
import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

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
  schema: "./src/server/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },

  migrations: {
    prefix: "timestamp",
    table: "_drizzle_migrations",
    schema: "public",
  },

  verbose: true,
  strict: true,
}) satisfies Config;
