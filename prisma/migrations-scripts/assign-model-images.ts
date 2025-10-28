#!/usr/bin/env tsx
/** biome-ignore-all lint/suspicious/noConsole: Migration script requires console output */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: Migration script with sequential logic */
/**
 * Data Migration Script: Assign Model Images
 *
 * Automatically assigns imageUrl to existing models based on name patterns.
 * Maps model names to available design images in /public/models/designs/
 *
 * Usage:
 *   pnpm tsx prisma/migrations-scripts/assign-model-images.ts
 *   pnpm tsx prisma/migrations-scripts/assign-model-images.ts --dry-run
 *   pnpm tsx prisma/migrations-scripts/assign-model-images.ts --verbose
 *
 * @version 1.0.0
 */

import { parseArgs } from "node:util";
import { db } from "../../src/server/db";

/**
 * Mapping rules: model name patterns to image filenames
 * Ordered by specificity (most specific first)
 */
const IMAGE_MAPPING_RULES: Array<{
  pattern: RegExp;
  imageUrl: string;
  description: string;
}> = [
  // Specific combinations first
  {
    description: "Doble practicable con fijo",
    imageUrl: "/models/designs/doble-practicable-fijo.svg",
    pattern: /doble.*practicable.*fijo|practicable.*doble.*fijo/i,
  },
  {
    description: "Oscilobatiente",
    imageUrl: "/models/designs/oscilobatiente.svg",
    pattern: /oscilobatiente/i,
  },
  {
    description: "OXXO - Fijo-Practicable-Practicable-Fijo",
    imageUrl: "/models/designs/oxxo.svg",
    pattern: /^oxxo$|fijo.*practicable.*practicable.*fijo/i,
  },
  {
    description: "OXXX - Fijo-Practicable-Practicable-Practicable",
    imageUrl: "/models/designs/oxxx.svg",
    pattern: /^oxxx$/i,
  },
  {
    description: "OXX - Fijo-Practicable-Practicable",
    imageUrl: "/models/designs/oxx.svg",
    pattern: /^oxx$|fijo.*practicable.*practicable(?!.*fijo)/i,
  },
  {
    description: "OX - Fijo-Practicable",
    imageUrl: "/models/designs/ox.svg",
    pattern: /^ox$|fijo.*practicable(?!.*practicable)/i,
  },
  {
    description: "XOX - Practicable-Fijo-Practicable",
    imageUrl: "/models/designs/xox.svg",
    pattern: /^xox$|practicable.*fijo.*practicable/i,
  },
  {
    description: "XO - Practicable-Fijo",
    imageUrl: "/models/designs/xo.svg",
    pattern: /^xo$|practicable.*fijo(?!.*practicable)/i,
  },
  {
    description: "XX - Doble practicable",
    imageUrl: "/models/designs/xx.svg",
    pattern: /^xx$|doble.*practicable(?!.*fijo)/i,
  },
  {
    description: "Proyectante tipo 2",
    imageUrl: "/models/designs/proyectante-2.svg",
    pattern: /proyectante.*2|proyectante.*tipo.*2/i,
  },
  {
    description: "Proyectante simple",
    imageUrl: "/models/designs/proyectante.svg",
    pattern: /proyectante(?!.*2)/i,
  },
  {
    description: "Practicable simple",
    imageUrl: "/models/designs/practicable.svg",
    pattern: /^practicable$|practicable(?!.*(doble|fijo|oscilobatiente))/i,
  },
];

/**
 * CLI options interface
 */
type CliOptions = {
  dryRun: boolean;
  verbose: boolean;
  help: boolean;
};

/**
 * Parse command-line arguments
 */
function parseCliArgs(): CliOptions {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      "dry-run": { default: false, type: "boolean" },
      help: { default: false, short: "h", type: "boolean" },
      verbose: { default: false, short: "v", type: "boolean" },
    },
  });

  return {
    dryRun: values["dry-run"] as boolean,
    help: values.help as boolean,
    verbose: values.verbose as boolean,
  };
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
Assign Model Images - Data Migration Script

Usage:
  pnpm tsx prisma/migrations-scripts/assign-model-images.ts [options]

Options:
  --dry-run       Show what would be updated without making changes
  --verbose, -v   Show detailed output
  --help, -h      Show this help message

Description:
  Automatically assigns imageUrl to existing models based on name patterns.
  Maps model names to available design images in /public/models/designs/

Examples:
  # Preview changes without updating database
  pnpm tsx prisma/migrations-scripts/assign-model-images.ts --dry-run

  # Execute migration with detailed output
  pnpm tsx prisma/migrations-scripts/assign-model-images.ts --verbose

  # Execute migration
  pnpm tsx prisma/migrations-scripts/assign-model-images.ts
  `);
}

/**
 * Find matching image for model name
 */
function findMatchingImage(modelName: string): string | null {
  for (const rule of IMAGE_MAPPING_RULES) {
    if (rule.pattern.test(modelName)) {
      return rule.imageUrl;
    }
  }
  return null;
}

/**
 * Migration statistics
 */
type MigrationStats = {
  totalModels: number;
  modelsWithImages: number;
  modelsWithoutImages: number;
  matched: number;
  updated: number;
  failed: number;
  skipped: number;
};

/**
 * Execute migration
 */
async function runMigration(options: CliOptions): Promise<MigrationStats> {
  const stats: MigrationStats = {
    failed: 0,
    matched: 0,
    modelsWithImages: 0,
    modelsWithoutImages: 0,
    skipped: 0,
    totalModels: 0,
    updated: 0,
  };

  console.log("\n🔍 Fetching models from database...\n");

  // Fetch all models
  const models = await db.model.findMany({
    select: {
      id: true,
      imageUrl: true,
      name: true,
    },
  });

  stats.totalModels = models.length;
  stats.modelsWithImages = models.filter((m) => m.imageUrl).length;
  stats.modelsWithoutImages = models.filter((m) => !m.imageUrl).length;

  console.log(`📊 Found ${stats.totalModels} models`);
  console.log(`   ✓ ${stats.modelsWithImages} already have images`);
  console.log(`   ○ ${stats.modelsWithoutImages} without images\n`);

  if (options.dryRun) {
    console.log("🔸 DRY RUN MODE - No changes will be made\n");
  }

  console.log("🔄 Processing models...\n");

  // Process each model
  for (const model of models) {
    // Skip models that already have images
    if (model.imageUrl) {
      if (options.verbose) {
        console.log(
          `⏭️  Skipping "${model.name}" - already has image: ${model.imageUrl}`
        );
      }
      stats.skipped++;
      continue;
    }

    // Find matching image
    const matchedImageUrl = findMatchingImage(model.name);

    if (!matchedImageUrl) {
      if (options.verbose) {
        console.log(`⚠️  No match for "${model.name}"`);
      }
      continue;
    }

    stats.matched++;

    if (options.verbose) {
      console.log(`✓ Match: "${model.name}" → ${matchedImageUrl}`);
    }

    // Update model (unless dry-run)
    if (!options.dryRun) {
      try {
        await db.model.update({
          data: { imageUrl: matchedImageUrl },
          where: { id: model.id },
        });
        stats.updated++;
      } catch (error) {
        console.error(`❌ Failed to update "${model.name}":`, error);
        stats.failed++;
      }
    }
  }

  return stats;
}

/**
 * Display final statistics
 */
function displayStats(stats: MigrationStats, dryRun: boolean) {
  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 Migration Summary");
  console.log("=".repeat(60));
  console.log(`Total models:          ${stats.totalModels}`);
  console.log(`Already with images:   ${stats.modelsWithImages}`);
  console.log(`Without images:        ${stats.modelsWithoutImages}`);
  console.log(`Matched patterns:      ${stats.matched}`);

  if (dryRun) {
    console.log(`Would update:          ${stats.matched}`);
  } else {
    console.log(`Successfully updated:  ${stats.updated}`);
    console.log(`Failed:                ${stats.failed}`);
  }

  console.log(`Skipped:               ${stats.skipped}`);
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("\n💡 Run without --dry-run to apply changes");
  } else if (stats.updated > 0) {
    console.log("\n✅ Migration completed successfully");
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseCliArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log("🖼️  Model Images Assignment Migration");

  try {
    const startTime = Date.now();
    const stats = await runMigration(options);
    const duration = Date.now() - startTime;

    displayStats(stats, options.dryRun);
    console.log(`\n⏱️  Completed in ${duration}ms\n`);

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    await db.$disconnect();
    process.exit(1);
  }
}

// Execute
void main();
