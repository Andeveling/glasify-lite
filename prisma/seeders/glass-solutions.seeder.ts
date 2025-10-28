/** biome-ignore-all lint/suspicious/noConsole: seeder requires console logging */
/**
 * Glass Solutions Seeder
 *
 * Seeds universal glass solution categories from data files.
 * Supports idempotent seeding with version tracking.
 *
 * Usage:
 *   pnpm seed:glass-solutions
 */

import { seedGlassSolutionsFromFile } from "../factories/glass-solution.factory";

/**
 * Main seeder function
 */
export async function seedGlassSolutions(): Promise<void> {
  console.log("🌱 Seeding glass solutions...\n");

  try {
    // Seed core glass solutions
    console.log("📦 Loading core glass solutions...");
    const result = await seedGlassSolutionsFromFile("glass-solutions.json");

    // Report results
    console.log(`✅ Seeded: ${result.seeded} glass solutions`);
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

    console.log("\n✨ Glass solutions seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Fatal error during glass solutions seeding:", error);
    process.exit(1);
  }
}

// Run seeder (ES modules don't have require.main, so we just run it)
seedGlassSolutions()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeder failed:", error);
    process.exit(1);
  });
