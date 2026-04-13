/** biome-ignore-all lint/suspicious/noConsole: seeder requires console logging */
/**
 * Design Templates Seeder
 *
 * Seeds base design templates for window visualization.
 * Implements idempotent upsert using unique constraint on name.
 *
 * Templates cover common window configurations:
 * - X: 1 hoja móvil (single sliding)
 * - O: 1 hoja fija (fixed pane)
 * - XX: 2 hojas móviles (double sliding)
 * - XO: Móvil + Fija (sliding + fixed)
 * - OX: Fija + Móvil (fixed + sliding)
 * - XXO: 2 móviles + 1 fija (double sliding + fixed)
 * - OXX: 1 fija + 2 móviles (fixed + double sliding)
 * - XOX: Móvil + Fija + Móvil (sliding + fixed + sliding)
 *
 * Usage:
 *   pnpm tsx prisma/seeders/design-templates.seeder.ts
 */

import logger from "../../src/lib/logger";
import { db } from "../../src/server/db";

const BASE_TEMPLATES: Array<{
  name: string
  pattern: string
  frameConfig: string
  showArrows: boolean
  showHandles: boolean
}> = [
  {
    name: "1 Hoja Móvil",
    pattern: "X",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: true,
    showHandles: true,
  },
  {
    name: "1 Hoja Fija",
    pattern: "O",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: false,
    showHandles: false,
  },
  {
    name: "2 Hojas Móviles",
    pattern: "XX",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: true,
    showHandles: true,
  },
  {
    name: "Móvil + Fija",
    pattern: "XO",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: true,
    showHandles: true,
  },
  {
    name: "Fija + Móvil",
    pattern: "OX",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: true,
    showHandles: true,
  },
  {
    name: "2 Móviles + 1 Fija",
    pattern: "XXO",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: true,
    showHandles: true,
  },
  {
    name: "1 Fija + 2 Móviles",
    pattern: "OXX",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: true,
    showHandles: true,
  },
  {
    name: "Móvil + Fija + Móvil",
    pattern: "XOX",
    frameConfig: JSON.stringify({ thickness: 4, profileStyle: "simple" }),
    showArrows: true,
    showHandles: true,
  },
]

async function seedDesignTemplates() {
  console.log("🪟 Seeding design templates...\n")

  let created = 0
  let updated = 0

  for (const template of BASE_TEMPLATES) {
    const existing = await db.designTemplate.findUnique({
      where: { name: template.name },
    })

    if (existing) {
      await db.designTemplate.update({
        where: { id: existing.id },
        data: {
          pattern: template.pattern,
          frameConfig: template.frameConfig,
          showArrows: template.showArrows,
          showHandles: template.showHandles,
        },
      })
      updated++
      console.log(`  ↻ Updated: ${template.name} (${template.pattern})`)
    } else {
      await db.designTemplate.create({ data: template })
      created++
      console.log(`  ✓ Created: ${template.name} (${template.pattern})`)
    }
  }

  console.log(`\n✅ Design templates seeded: ${created} created, ${updated} updated`)

  logger.info("Design templates seeded", {
    created,
    updated,
    total: BASE_TEMPLATES.length,
  })
}

seedDesignTemplates()
  .then(() => {
    console.log("\n✨ Design templates seeding completed!\n")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error seeding design templates:", error)
    logger.error("Error seeding design templates", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
