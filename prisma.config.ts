// Load environment variables from .env.local and .env files
// Required when using prisma.config.ts (Prisma skips auto-loading .env)
// @see https://www.prisma.io/docs/orm/reference/prisma-config-reference#using-environment-variables
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local first (takes precedence), then .env
config({ path: ".env.local" });
config();

/**
 * Prisma Configuration (v7)
 * @see https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DATABASE_URL"),
  },

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed-cli.ts --preset=minimal",
  },
});
