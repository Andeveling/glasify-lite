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

import { parseArgs } from 'node:util';
import { db } from '../src/server/db';
import { demoClientPreset } from './data/presets/demo-client.preset';
import { fullCatalogPreset } from './data/presets/full-catalog.preset';
// Import presets (NO BARRELS - direct imports)
import { minimalPreset } from './data/presets/minimal.preset';
import type { SeedPreset } from './seeders/seed-orchestrator';
import { SeedOrchestrator } from './seeders/seed-orchestrator';

/**
 * Available presets registry
 */
const PRESETS: Record<string, SeedPreset> = {
  'demo-client': demoClientPreset,
  'full-catalog': fullCatalogPreset,
  minimal: minimalPreset,
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
      'continue-on-error': {
        default: false,
        type: 'boolean',
      },
      help: {
        default: false,
        short: 'h',
        type: 'boolean',
      },
      preset: {
        default: 'minimal',
        short: 'p',
        type: 'string',
      },
      'skip-validation': {
        default: false,
        type: 'boolean',
      },
      verbose: {
        default: false,
        short: 'v',
        type: 'boolean',
      },
    },
    strict: true,
  });

  return {
    continueOnError: values['continue-on-error'] ?? false,
    help: values.help ?? false,
    preset: values.preset ?? 'minimal',
    skipValidation: values['skip-validation'] ?? false,
    verbose: values.verbose ?? false,
  };
}

/**
 * Print CLI help
 */
function printHelp(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   Glasify Lite - Seed CLI                      ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  pnpm seed [OPTIONS]

OPTIONS:
  -p, --preset <name>       Preset to use (default: minimal)
  -v, --verbose             Enable verbose logging
  --skip-validation         Skip factory validation (faster, risky)
  --continue-on-error       Continue seeding even if some entities fail
  -h, --help                Show this help message

AVAILABLE PRESETS:
  minimal                   10 records (CI/CD, quick testing)
  demo-client               30 records (client demos, presentations)
  full-catalog              57 records (production, complete catalog)

EXAMPLES:
  pnpm seed                            # Seed with minimal preset
  pnpm seed --preset=demo-client       # Seed with demo-client preset
  pnpm seed --preset=full-catalog -v   # Seed with full catalog (verbose)
  pnpm seed --skip-validation          # Fast seed without validation

For more info, see: prisma/data/presets/README.md
  `);
}

/**
 * Validate preset name
 */
function validatePreset(presetName: string): void {
  const availablePresets = Object.keys(PRESETS);

  if (!availablePresets.includes(presetName)) {
    console.error(`\n❌ Error: Unknown preset "${presetName}"`);
    console.error(`\nAvailable presets: ${availablePresets.join(', ')}\n`);
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
    console.error(`\n❌ Error: Preset "${options.preset}" not found in registry\n`);
    process.exit(1);
  }

  // Print banner
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Glasify Lite - Database Seeding                   ║
╚════════════════════════════════════════════════════════════════╝
  `);

  console.log(`📦 Preset: ${preset.name}`);
  console.log(`📝 Description: ${preset.description}`);
  console.log('🔧 Options:', {
    continueOnError: options.continueOnError,
    skipValidation: options.skipValidation,
    verbose: options.verbose,
  });
  console.log('');

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
      console.error(`\n⚠️  Seeding completed with ${stats.totalFailed} failures\n`);
      process.exit(1);
    }

    console.log('\n✨ Seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:\n');
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run CLI
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
