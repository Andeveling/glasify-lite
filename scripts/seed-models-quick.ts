/**
 * Quick seeder to add sample models to database
 * Run with: tsx scripts/seed-models-quick.ts
 */

import { db } from "@/server/db/drizzle";
import { models } from "@/server/db/schemas/model.schema";

const sampleModels = [
  {
    name: "Ventana Corrediza Standard",
    code: "VCS-100",
    category: "window",
    subcategory: "sliding",
    description: "Ventana corrediza de aluminio para uso residencial",
    isActive: true,
  },
  {
    name: "Puerta Batiente Premium",
    code: "PBP-200",
    category: "door",
    subcategory: "hinged",
    description: "Puerta batiente de aluminio con marco reforzado",
    isActive: true,
  },
  {
    name: "Ventana Proyectante",
    code: "VPR-150",
    category: "window",
    subcategory: "awning",
    description: "Ventana proyectante con sistema de apertura superior",
    isActive: true,
  },
  {
    name: "Puerta Corrediza Doble",
    code: "PCD-300",
    category: "door",
    subcategory: "sliding",
    description: "Puerta corrediza doble para espacios amplios",
    isActive: true,
  },
  {
    name: "Ventana Fija Panorámica",
    code: "VFP-180",
    category: "window",
    subcategory: "fixed",
    description: "Ventana fija de gran formato para máxima iluminación",
    isActive: true,
  },
];

async function seedModels() {
  console.log("🌱 Seeding sample models...\n");

  try {
    for (const model of sampleModels) {
      const result = await db
        .insert(models)
        .values(model)
        .onConflictDoNothing({ target: models.code })
        .returning();

      if (result.length > 0) {
        console.log(`✓ Created: ${model.name} (${model.code})`);
      } else {
        console.log(`⊘ Skipped (exists): ${model.name} (${model.code})`);
      }
    }

    console.log(
      `\n✅ Seeding completed! Created ${sampleModels.length} models`
    );
  } catch (error) {
    console.error("❌ Error seeding models:", error);
    process.exit(1);
  }
}

seedModels()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
