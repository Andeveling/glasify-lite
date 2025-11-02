/** biome-ignore-all lint/suspicious/noConsole: seeder requires console logging */
/**
 * Colors Seeder
 *
 * Seeds the master color catalog with 10 industry-standard colors.
 * Implements idempotent upsert using unique constraint on [name, hexCode].
 *
 * Colors are based on spec.md FR-001:
 * - Blanco (RAL 9010, #F3F3E9)
 * - Gris Antracita (RAL 7016, #384043)
 * - Negro Mate (RAL 9005, #101010)
 * - Gris Medio (RAL 7022, #464A4B)
 * - Natural Anodizado Plata (RAL 9006, #A0A8A9)
 * - Madera Roble Oscuro (#794D35)
 * - Marrón Chocolate (RAL 8017, #4E3730)
 * - Gris Perla/Beige (RAL 1013, #E4E0D6)
 * - Inox/Acero (RAL 9007, #8D9395)
 * - Champagne C33 (#D8C3A4)
 *
 * Usage:
 *   pnpm tsx prisma/seeders/colors.seeder.ts
 */

import { type Prisma, PrismaClient } from "@prisma/client";
import logger from "../../src/lib/logger";

const prisma = new PrismaClient();

// Standard colors from spec.md FR-001
const STANDARD_COLORS: Prisma.ColorCreateInput[] = [
	{
		name: "Blanco",
		ralCode: "RAL 9010",
		hexCode: "#F3F3E9",
		isActive: true,
	},
	{
		name: "Gris Antracita",
		ralCode: "RAL 7016",
		hexCode: "#384043",
		isActive: true,
	},
	{
		name: "Negro Mate",
		ralCode: "RAL 9005",
		hexCode: "#101010",
		isActive: true,
	},
	{
		name: "Gris Medio",
		ralCode: "RAL 7022",
		hexCode: "#464A4B",
		isActive: true,
	},
	{
		name: "Natural Anodizado Plata",
		ralCode: "RAL 9006",
		hexCode: "#A0A8A9",
		isActive: true,
	},
	{
		name: "Madera Roble Oscuro",
		ralCode: null, // No RAL code for wood finishes
		hexCode: "#794D35",
		isActive: true,
	},
	{
		name: "Marrón Chocolate",
		ralCode: "RAL 8017",
		hexCode: "#4E3730",
		isActive: true,
	},
	{
		name: "Gris Perla/Beige",
		ralCode: "RAL 1013",
		hexCode: "#E4E0D6",
		isActive: true,
	},
	{
		name: "Inox/Acero",
		ralCode: "RAL 9007",
		hexCode: "#8D9395",
		isActive: true,
	},
	{
		name: "Champagne",
		ralCode: "C33", // Custom code (not RAL standard)
		hexCode: "#D8C3A4",
		isActive: true,
	},
];

/**
 * Seed colors with idempotent upsert
 * Uses unique constraint on [name, hexCode] for conflict resolution
 */
export async function seedColors(): Promise<void> {
	console.log("🌱 Seeding color catalog...\n");
	logger.info("Color seed started", {
		totalColors: STANDARD_COLORS.length,
	});

	let seeded = 0;
	let updated = 0;
	const skipped = 0;
	const errors: Array<{ color: string; error: string }> = [];

	try {
		// Use transaction for atomicity
		await prisma.$transaction(async (tx) => {
			for (const colorData of STANDARD_COLORS) {
				try {
					const result = await tx.color.upsert({
						where: {
							name_hexCode: {
								name: colorData.name,
								hexCode: colorData.hexCode,
							},
						},
						update: {
							ralCode: colorData.ralCode,
							isActive: colorData.isActive,
						},
						create: colorData,
					});

					// Determine if it was a create or update
					const existingColor = await tx.color.findFirst({
						where: {
							id: result.id,
							updatedAt: { lt: new Date() },
						},
					});

					if (existingColor) {
						updated++;
						console.log(
							`  ✓ Updated: ${colorData.name} (${colorData.hexCode})`,
						);
					} else {
						seeded++;
						console.log(
							`  + Created: ${colorData.name} (${colorData.hexCode})`,
						);
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					errors.push({ color: colorData.name, error: errorMessage });
					logger.error("Color seed failed for color", {
						color: colorData.name,
						error: errorMessage,
					});
				}
			}
		});

		// Report results
		console.log(`\n✅ Created: ${seeded} new colors`);
		console.log(`📝 Updated: ${updated} existing colors`);
		console.log(`⏭️  Skipped: ${skipped} (no changes needed)`);

		if (errors.length > 0) {
			console.log(`\n❌ Errors: ${errors.length}`);
			for (const { color, error } of errors) {
				console.error(`  - ${color}: ${error}`);
			}
			logger.error("Color seed completed with errors", {
				seeded,
				updated,
				errorCount: errors.length,
			});
			process.exit(1);
		}

		logger.info("Color seed completed successfully", {
			seeded,
			updated,
		});
		console.log("\n✨ Color catalog seeding completed successfully!");
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("\n❌ Fatal error during color seeding:", errorMessage);
		logger.error("Color seed failed with fatal error", {
			error: errorMessage,
		});
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Run seeder
seedColors()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("Seeder failed:", error);
		process.exit(1);
	});
