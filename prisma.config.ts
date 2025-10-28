// Load environment variables from .env file
// Required when using prisma.config.ts (Prisma skips auto-loading .env)
// @see https://www.prisma.io/docs/orm/reference/prisma-config-reference#using-environment-variables
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma Configuration
 * @see https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
export default defineConfig({
  migrations: {
    // Seed command executed after migrations or when running `npx prisma db seed`
    seed: "tsx prisma/seed-cli.ts --preset=minimal",
  },
});
