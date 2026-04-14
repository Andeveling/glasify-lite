#!/usr/bin/env tsx
/**
 * Seed CLI - Command-line interface for database seeding
 *
 * Usage:
 *   pnpm tsx prisma/seed-cli.ts --preset=minimal
 *   pnpm tsx prisma/seed-cli.ts --preset=vitro-rojas-panama
 *   pnpm tsx prisma/seed-cli.ts --preset=vitro-rojas-panama --verbose
 *
 * @version 1.0.0
 */
// @ts-nocheck

import { parseArgs } from "node:util";
import { db } from "../src/server/db";
import { minimalPreset } from "./data/presets/minimal.preset";
import { vitroRojasPanamaPreset } from "./data/presets/vitro-rojas-panama.preset";
import { SeedOrchestrator } from "./seeders/seed-orchestrator";
import type { SeedPreset } from "./seeders/seed-orchestrator";

const PRESETS: Record<string, SeedPreset> = {
  minimal: minimalPreset,
  "vitro-rojas-panama": vitroRojasPanamaPreset,
};

type CliOptions = {
  preset: string;
  verbose: boolean;
  skipValidation: boolean;
  continueOnError: boolean;
  help: boolean;
};

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

function validatePreset(presetName: string): void {
  const availablePresets = Object.keys(PRESETS);
  if (!availablePresets.includes(presetName)) {
    console.error(`Unknown preset: ${presetName}. Available: ${availablePresets.join(", ")}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const options = parseCliArgs();

  if (options.help) {
    console.log("Usage: pnpm tsx prisma/seed-cli.ts --preset=<name>");
    console.log("Available presets:", Object.keys(PRESETS).join(", "));
    process.exit(0);
  }

  validatePreset(options.preset);

  const preset = PRESETS[options.preset];
  if (!preset) {
    process.exit(1);
  }

  try {
    const orchestrator = new SeedOrchestrator(db, {
      continueOnError: options.continueOnError,
      skipValidation: options.skipValidation,
      verbose: options.verbose,
    });

    const stats = await orchestrator.seedWithPreset(preset);

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

main().catch((_error) => {
  process.exit(1);
});
