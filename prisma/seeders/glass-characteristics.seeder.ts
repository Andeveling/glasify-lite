/** biome-ignore-all lint/suspicious/noConsole: seeder requires console logging */
/**
 * Glass Characteristics Seeder
 *
 * Seeds standardized glass characteristics from data files.
 * Supports idempotent seeding with version tracking.
 *
 * Usage:
 *   pnpm seed:glass-characteristics
 */

import { seedGlassCharacteristicsFromFile } from "../factories/glass-characteristic.factory";

/**
 * Main seeder function
 */
export async function seedGlassCharacteristics(): Promise<void> {
  console.log("🌱 Seeding glass characteristics...\n");

  try {
    // Seed core glass characteristics
    console.log("📦 Loading core glass characteristics...");
    const result = await seedGlassCharacteristicsFromFile(
      "glass-characteristics.json"
    );

    // Report results
    console.log(`✅ Seeded: ${result.seeded} glass characteristics`);
    console.log(`⏭️  Skipped: ${result.skipped} (already up-to-date)`);

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors: ${result.errors.length}`);
      for (const error of result.errors) {
        console.error(`  - ${error.message}`);
        if (error.context) {
          console.error("    Context:", error.context);
        }
      }
      process.exit(1);
    }

    console.log("\n✨ Glass characteristics seeding completed successfully!");
  } catch (error) {
    console.error(
      "\n❌ Fatal error during glass characteristics seeding:",
      error
    );
    process.exit(1);
  }
}

// Run seeder (ES modules don't have require.main, so we just run it)
seedGlassCharacteristics()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeder failed:", error);
    process.exit(1);
  });
