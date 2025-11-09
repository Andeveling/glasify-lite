#!/usr/bin/env tsx
/**
 * Drizzle Kit Setup Verification Script
 * 
 * Verifies that Drizzle Kit is correctly configured and ready to use.
 * 
 * Checks:
 * 1. Environment variables (DATABASE_URL, DIRECT_URL)
 * 2. Schema file existence (src/server/db/schema.ts)
 * 3. Drizzle config file (drizzle.config.ts)
 * 4. Migration directory structure
 * 
 * Usage:
 *   pnpm tsx scripts/verify-drizzle-setup.ts
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

const CHECKS = {
  ENV_DATABASE_URL: "DATABASE_URL environment variable",
  ENV_DIRECT_URL: "DIRECT_URL environment variable",
  SCHEMA_FILE: "Schema file (src/server/db/schema.ts)",
  CONFIG_FILE: "Drizzle config (drizzle.config.ts)",
  MIGRATIONS_DIR: "Migrations directory (drizzle/migrations)",
};

type CheckResult = {
  name: string;
  status: "✅" | "⚠️" | "❌";
  message: string;
};

const URL_PREVIEW_LENGTH = 30;

const results: CheckResult[] = [];

// Check 1: DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
results.push({
  name: CHECKS.ENV_DATABASE_URL,
  status: databaseUrl ? "✅" : "❌",
  message: databaseUrl
    ? `Found: ${databaseUrl.slice(0, URL_PREVIEW_LENGTH)}...`
    : "Missing - required for database connection",
});

// Check 2: DIRECT_URL (optional but recommended for Neon)
const directUrl = process.env.DIRECT_URL;
results.push({
  name: CHECKS.ENV_DIRECT_URL,
  status: directUrl ? "✅" : "⚠️",
  message: directUrl
    ? `Found: ${directUrl.slice(0, URL_PREVIEW_LENGTH)}...`
    : "Optional - recommended for Neon Database pooling",
});

// Check 3: Schema file
const schemaPath = join(process.cwd(), "src", "server", "db", "schema.ts");
const schemaExists = existsSync(schemaPath);
results.push({
  name: CHECKS.SCHEMA_FILE,
  status: schemaExists ? "✅" : "❌",
  message: schemaExists
    ? `Found at ${schemaPath}`
    : `Not found at ${schemaPath}`,
});

// Check 4: Config file
const configPath = join(process.cwd(), "drizzle.config.ts");
const configExists = existsSync(configPath);
results.push({
  name: CHECKS.CONFIG_FILE,
  status: configExists ? "✅" : "❌",
  message: configExists
    ? `Found at ${configPath}`
    : `Not found at ${configPath}`,
});

// Check 5: Migrations directory
const migrationsPath = join(process.cwd(), "drizzle", "migrations");
const migrationsExists = existsSync(migrationsPath);
results.push({
  name: CHECKS.MIGRATIONS_DIR,
  status: migrationsExists ? "✅" : "⚠️",
  message: migrationsExists
    ? `Found at ${migrationsPath}`
    : "Not found - will be created on first migration",
});

// Print results
console.log("\n🔍 Drizzle Kit Setup Verification\n");
console.log("=".repeat(60));

for (const result of results) {
  console.log(`\n${result.status} ${result.name}`);
  console.log(`   ${result.message}`);
}

// Summary
const errors = results.filter((r) => r.status === "❌").length;
const warnings = results.filter((r) => r.status === "⚠️").length;
const passed = results.filter((r) => r.status === "✅").length;

console.log(`\n${"=".repeat(60)}`);
console.log(`\n📊 Summary: ${passed} passed, ${warnings} warnings, ${errors} errors\n`);

if (errors > 0) {
  console.log("❌ Setup incomplete - please fix errors before proceeding\n");
  process.exit(1);
}

if (warnings > 0) {
  console.log("⚠️  Setup OK with warnings - consider addressing them\n");
  process.exit(0);
}

console.log("✅ Setup complete - ready to use Drizzle Kit!\n");
console.log("Next steps:");
console.log("  1. pnpm db:generate  - Generate migration from schema");
console.log("  2. pnpm db:migrate   - Apply migration to database");
console.log("  3. pnpm db:studio    - Open Drizzle Studio UI\n");

process.exit(0);
