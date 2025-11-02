/** biome-ignore-all lint/suspicious/noConsole: seeder requires console logging */
/**
 * Glass Types Seeder
 *
 * Seeds standardized glass types from manufacturer data files.
 * Supports idempotent seeding with version tracking.
 *
 * Usage:
 *   pnpm seed:glass-types
 */

import { seedGlassTypesFromFile } from "../factories/glass-type.factory";

/**
 * Main seeder function
 */
export async function seedGlassTypes(): Promise<void> {
	console.log("🌱 Seeding glass types...\n");

	try {
		// Seed Tecnoglass glass types
		console.log("📦 Loading Tecnoglass glass types...");
		const tecnoglassResult = await seedGlassTypesFromFile(
			"glass-types-tecnoglass.json",
		);

		// Report results
		console.log(`✅ Seeded: ${tecnoglassResult.seeded} glass types`);
		console.log(`⏭️  Skipped: ${tecnoglassResult.skipped} (already up-to-date)`);

		if (tecnoglassResult.errors.length > 0) {
			console.log(`\n❌ Errors: ${tecnoglassResult.errors.length}`);
			for (const error of tecnoglassResult.errors) {
				console.error(`  - ${error.message}`);
				if (error.context) {
					console.error("    Context:", error.context);
				}
			}
			process.exit(1);
		}

		console.log("\n✨ Glass types seeding completed successfully!");
	} catch (error) {
		console.error("\n❌ Fatal error during glass types seeding:", error);
		process.exit(1);
	}
}

// Run seeder (ES modules don't have require.main, so we just run it)
seedGlassTypes()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("Seeder failed:", error);
		process.exit(1);
	});
