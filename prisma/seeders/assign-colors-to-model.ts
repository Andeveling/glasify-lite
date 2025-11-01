/** biome-ignore-all lint/suspicious/noConsole: seeder requires console logging */
/**
 * Assign Colors to Model Seeder
 *
 * Assigns 3 colors to the first available model for testing color selection feature.
 * One color will be marked as default.
 *
 * Usage:
 *   pnpm tsx prisma/seeders/assign-colors-to-model.ts
 */

import { PrismaClient } from "@prisma/client";
import logger from "../../src/lib/logger";

const prisma = new PrismaClient();

// Constants
const REQUIRED_COLORS_COUNT = 3;
const COLOR_INDEX_WHITE = 0;
const COLOR_INDEX_GRAY = 1;
const COLOR_INDEX_BLACK = 2;

async function assignColorsToModel() {
  console.log("🎨 Assigning colors to model for testing...\n");

  try {
    // Get first published model
    const model = await prisma.model.findFirst({
      where: { status: "published" },
      select: { id: true, name: true },
    });

    if (!model) {
      console.error(
        "❌ No published models found. Please create a model first."
      );
      process.exit(1);
    }

    console.log(`📦 Found model: ${model.name} (${model.id})\n`);

    // Get 3 colors: Blanco, Gris Antracita, Negro Mate
    const colors = await prisma.color.findMany({
      where: {
        name: {
          in: ["Blanco", "Gris Antracita", "Negro Mate"],
        },
      },
      select: { id: true, name: true },
    });

    if (colors.length < REQUIRED_COLORS_COUNT) {
      console.error(
        "❌ Not enough colors found. Please run colors seeder first."
      );
      process.exit(1);
    }

    console.log(`🎨 Found ${colors.length} colors to assign:\n`);

    // Delete existing assignments for this model
    await prisma.modelColor.deleteMany({
      where: { modelId: model.id },
    });

    // Assign colors with different surcharges
    const whiteColor = colors[COLOR_INDEX_WHITE];
    const grayColor = colors[COLOR_INDEX_GRAY];
    const blackColor = colors[COLOR_INDEX_BLACK];

    const hasAllColors = whiteColor && grayColor && blackColor;
    if (!hasAllColors) {
      console.error("❌ Missing required colors");
      process.exit(1);
    }

    const assignments = [
      {
        modelId: model.id,
        colorId: whiteColor.id, // Blanco
        surchargePercentage: 0, // No surcharge for default
        isDefault: true,
      },
      {
        modelId: model.id,
        colorId: grayColor.id, // Gris Antracita
        surchargePercentage: 15, // 15% surcharge
        isDefault: false,
      },
      {
        modelId: model.id,
        colorId: blackColor.id, // Negro Mate
        surchargePercentage: 20, // 20% surcharge
        isDefault: false,
      },
    ];

    let created = 0;
    for (const assignment of assignments) {
      const color = colors.find((c) => c.id === assignment.colorId);
      await prisma.modelColor.create({ data: assignment });
      console.log(
        `  ✓ Assigned: ${color?.name} (${assignment.surchargePercentage}% surcharge${assignment.isDefault ? ", DEFAULT" : ""})`
      );
      created++;
    }

    console.log(
      `\n✅ Successfully assigned ${created} colors to model "${model.name}"`
    );

    logger.info("Colors assigned to model", {
      modelId: model.id,
      modelName: model.name,
      colorsAssigned: created,
    });
  } catch (error) {
    console.error("❌ Error assigning colors:", error);
    logger.error("Error assigning colors to model", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

assignColorsToModel()
  .then(() => {
    console.log("\n✨ Color assignment completed successfully!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
