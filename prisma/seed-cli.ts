#!/usr/bin/env tsx
/**
 * Seed CLI - Command-line interface for database seeding
 *
 * Usage:
 *   pnpm seed --preset=minimal
 *   pnpm seed --preset=demo-client
 *   pnpm seed --preset=full-catalog
 *   pnpm seed --preset=minimal --verbose
 *   pnpm seed --preset=demo-client --skip-validation
 *
 * @version 1.0.0
 */
// @ts-nocheck
/* biome-ignore lint/suspicious/noConsole: CLI script requires console output */

import { parseArgs } from "node:util";
import { db } from "../src/server/db";
import { demoClientPreset } from "./data/presets/demo-client.preset";
import { fullCatalogPreset } from "./data/presets/full-catalog.preset";
// Import presets (NO BARRELS - direct imports)
import { minimalPreset } from "./data/presets/minimal.preset";
import { vidriosLaEquidadColombiaPreset } from "./data/presets/vidrios-la-equidad-colombia.preset";
import { vitroRojasPanamaPreset } from "./data/presets/vitro-rojas-panama.preset";
import type { SeedPreset } from "./seeders/seed-orchestrator";
import { SeedOrchestrator } from "./seeders/seed-orchestrator";

/**
 * Available presets registry
 */
const PRESETS: Record<string, SeedPreset> = {
  "demo-client": demoClientPreset,
  "full-catalog": fullCatalogPreset,
  minimal: minimalPreset,
  "vidrios-la-equidad-colombia": vidriosLaEquidadColombiaPreset,
  "vitro-rojas-panama": vitroRojasPanamaPreset,
};

/**
 * CLI configuration
 */
interface CliOptions {
  preset: string;
  verbose: boolean;
  skipValidation: boolean;
  continueOnError: boolean;
  help: boolean;
}

/**
 * Parse command-line arguments
 */
function parseCliArgs(): CliOptions {
  const { values } = parseArgs({
    options: {
      "continue-on-error": {
        default: false,
        type: "boolean",
      },
      help: {
        default: false,
        short: "h",
        type: "boolean",
      },
      preset: {
        default: "minimal",
        short: "p",
        type: "string",
      },
      "skip-validation": {
        default: false,
        type: "boolean",
      },
      verbose: {
        default: false,
        short: "v",
        type: "boolean",
      },
    },
    strict: true,
  });

  return {
    continueOnError: values["continue-on-error"] ?? false,
    help: values.help ?? false,
    preset: values.preset ?? "minimal",
    skipValidation: values["skip-validation"] ?? false,
    verbose: values.verbose ?? false,
  };
}

/**
 * Print CLI help
 */
function printHelp(): void {}

/**
 * Validate preset name
 */
function validatePreset(presetName: string): void {
  const availablePresets = Object.keys(PRESETS);

  if (!availablePresets.includes(presetName)) {
    process.exit(1);
  }
}

/**
 * Main seed function
 */
async function main(): Promise<void> {
  const options = parseCliArgs();

  // Show help and exit
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Validate preset
  validatePreset(options.preset);

  const preset = PRESETS[options.preset];
  if (!preset) {
    process.exit(1);
  }

  try {
    // Create orchestrator
    const orchestrator = new SeedOrchestrator(db, {
      continueOnError: options.continueOnError,
      skipValidation: options.skipValidation,
      verbose: options.verbose,
    });

    // Run seeding
    const stats = await orchestrator.seedWithPreset(preset);

    // Exit with appropriate code
    if (stats.totalFailed > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (_error) {
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run CLI
main().catch((_error) => {
  process.exit(1);
});
