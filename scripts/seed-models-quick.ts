/**
 * Quick seeder to add sample models to database
 * Run with: tsx scripts/seed-models-quick.ts
 */

import { db } from "@/server/db/drizzle";
import { models } from "@/server/db/schemas/model.schema";

const sampleModels = [
  {
    id: crypto.randomUUID(),
    name: "Ventana Corrediza Standard",
    imageUrl: "",
    status: "draft" as const,
    minWidthMm: "500",
    maxWidthMm: "2000",
    minHeightMm: "500",
    maxHeightMm: "2000",
    basePrice: "150.00",
    costPerMmWidth: "0.05",
    costPerMmHeight: "0.05",
    glassDiscountWidthMm: "0",
    glassDiscountHeightMm: "0",
    compatibleGlassTypeIds: [],
  },
  {
    id: crypto.randomUUID(),
    name: "Puerta Batiente Premium",
    imageUrl: "",
    status: "draft" as const,
    minWidthMm: "700",
    maxWidthMm: "1200",
    minHeightMm: "1800",
    maxHeightMm: "2400",
    basePrice: "250.00",
    costPerMmWidth: "0.08",
    costPerMmHeight: "0.08",
    glassDiscountWidthMm: "0",
    glassDiscountHeightMm: "0",
    compatibleGlassTypeIds: [],
  },
  {
    id: crypto.randomUUID(),
    name: "Ventana Proyectante",
    imageUrl: "",
    status: "draft" as const,
    minWidthMm: "400",
    maxWidthMm: "1500",
    minHeightMm: "400",
    maxHeightMm: "1500",
    basePrice: "180.00",
    costPerMmWidth: "0.06",
    costPerMmHeight: "0.06",
    glassDiscountWidthMm: "0",
    glassDiscountHeightMm: "0",
    compatibleGlassTypeIds: [],
  },
  {
    id: crypto.randomUUID(),
    name: "Puerta Corrediza Doble",
    imageUrl: "",
    status: "draft" as const,
    minWidthMm: "1400",
    maxWidthMm: "3000",
    minHeightMm: "1800",
    maxHeightMm: "2400",
    basePrice: "350.00",
    costPerMmWidth: "0.10",
    costPerMmHeight: "0.10",
    glassDiscountWidthMm: "0",
    glassDiscountHeightMm: "0",
    compatibleGlassTypeIds: [],
  },
  {
    id: crypto.randomUUID(),
    name: "Ventana Fija Panorámica",
    imageUrl: "",
    status: "draft" as const,
    minWidthMm: "800",
    maxWidthMm: "3500",
    minHeightMm: "800",
    maxHeightMm: "2500",
    basePrice: "200.00",
    costPerMmWidth: "0.07",
    costPerMmHeight: "0.07",
    glassDiscountWidthMm: "0",
    glassDiscountHeightMm: "0",
    compatibleGlassTypeIds: [],
  },
];

async function seedModels() {
  console.log("🌱 Seeding sample models...\n");

  let created = 0;

  try {
    // First, check if models already exist
    const existing = await db.select({ name: models.name }).from(models);
    const existingNames = new Set(existing.map((m) => m.name));

    for (const model of sampleModels) {
      if (existingNames.has(model.name)) {
        console.log(`⊘ Skipped (exists): ${model.name}`);
        continue;
      }

      await db.insert(models).values(model);
      console.log(`✓ Created: ${model.name}`);
      created++;
    }

    console.log(`\n✅ Seeding completed! Created ${created} models`);
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
