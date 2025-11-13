/**
 * Seed CLI - Drizzle Implementation
 *
 * Command-line interface for seeding the database using Drizzle ORM.
 * Replaces the Prisma-based seeding system.
 *
 * @version 2.0.0 - Drizzle Migration
 * @date 2025-11-09
 *
 * Usage:
 *   pnpm seed:drizzle --preset=minimal
 *   pnpm seed:drizzle --preset=vitro-rojas-panama
 *   pnpm seed:drizzle --preset=minimal --verbose
 *   pnpm seed:drizzle --preset=minimal --fresh        # Clean database first
 *   pnpm seed:drizzle --preset=minimal --fresh -v     # Clean + verbose
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { SeedPreset } from "../orchestrators/seed-orchestrator";
import { DrizzleSeedOrchestrator } from "../orchestrators/seed-orchestrator";
import { minimalPreset } from "../presets/minimal.preset";
import { vitroRojasPanamaPreset } from "../presets/vitro-rojas-panama.preset";
import type { ISeederLogger } from "../types/base.types";

// Load environment variables
config({ path: ".env.local" });

/**
 * CLI Logger for seed scripts
 * Uses console for CLI output (allowed in seed scripts)
 */
export class CLISeederLogger implements ISeederLogger {
  private readonly verbose: boolean;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(message);
  }

  warn(message: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.warn(`⚠️  ${message}`);
  }

  error(message: string, error?: Error): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.error(`❌ ${message}`);
    if (error && this.verbose) {
      // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
      console.error(error);
    }
  }

  debug(message: string): void {
    if (this.verbose) {
      // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
      console.debug(`🔍 ${message}`);
    }
  }

  section(title: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(`\n━━━ ${title} ━━━\n`);
  }

  success(message: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(`✅ ${message}`);
  }
}

/**
 * Available presets
 */
const PRESETS: Record<string, SeedPreset> = {
  minimal: minimalPreset,
  "vitro-rojas-panama": vitroRojasPanamaPreset,
};

/**
 * Parse CLI arguments
 */
function parseArgs(): { preset: string; verbose: boolean; fresh: boolean } {
  const args = process.argv.slice(2);

  let preset = "minimal"; // Default preset
  let verbose = false;
  let fresh = false;

  for (const arg of args) {
    if (arg.startsWith("--preset=")) {
      preset = arg.split("=")[1] ?? "minimal";
    } else if (arg === "--verbose" || arg === "-v") {
      verbose = true;
    } else if (arg === "--fresh" || arg === "-f") {
      fresh = true;
    }
  }

  return { preset, verbose, fresh };
}

/**
 * Main seed function
 */
async function seed() {
  const { preset: presetName, verbose, fresh } = parseArgs();

  // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
  console.log("\n🌱 Glasify Seed CLI (Drizzle)");
  // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Validate preset
  const preset = PRESETS[presetName];
  if (!preset) {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.error(`❌ Invalid preset: "${presetName}"`);
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log("\nAvailable presets:");
    for (const key of Object.keys(PRESETS)) {
      // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
      console.log(`  - ${key}`);
    }
    process.exit(1);
  }

  // Validate environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  // Create database connection
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(`📦 Using preset: ${presetName}`);
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(`🔗 Database: ${databaseUrl.split("@")[1]}\n`);

    // Run seed orchestrator
    const orchestrator = new DrizzleSeedOrchestrator(db, {
      verbose,
      continueOnError: false,
    });

    const stats = await orchestrator.seedWithPreset(preset, { fresh });

    // Print final summary
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log("\n✅ Seeding completed successfully!");
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log("\nStatistics:");
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(
      `  Glass Solutions: ${stats.glassSolutions.created} created, ${stats.glassSolutions.updated} updated`
    );
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(
      `  Profile Suppliers: ${stats.profileSuppliers.created} created, ${stats.profileSuppliers.updated} updated`
    );
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(
      `  Glass Suppliers: ${stats.glassSuppliers.created} created, ${stats.glassSuppliers.updated} updated`
    );
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(
      `  Total: ${stats.totalCreated} created, ${stats.totalUpdated} updated`
    );
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.log(`  Duration: ${stats.durationMs}ms`);

    process.exit(0);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seed
seed().catch((error) => {
  // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI scripts
  console.error("Fatal error:", error);
  process.exit(1);
});
