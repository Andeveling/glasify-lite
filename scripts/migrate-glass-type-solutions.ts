/**
 * Migration Script: Populate GlassTypeSolution relationships
 *
 * This script migrates from the deprecated `GlassPurpose` enum to the
 * new Many-to-Many GlassTypeSolution relationship table.
 *
 * Run with: npx tsx scripts/migrate-glass-type-solutions.ts
 */

import { PrismaClient } from '@prisma/client';
import { calculateGlassSolutions, createGlassTypeSolution } from '../prisma/factories/glass-type-solution.factory';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Migrating GlassType → GlassTypeSolution ===\n');

  // Step 1: Get all glass solutions
  const solutions = await prisma.glassSolution.findMany();
  const solutionMap = new Map(solutions.map((s) => [s.key, s.id]));

  console.log(`Found ${solutions.length} glass solutions:`);
  for (const s of solutions) {
    console.log(`  - ${s.key}: ${s.nameEs}`);
  }

  // Step 2: Get all glass types
  const glassTypes = await prisma.glassType.findMany({
    select: {
      id: true,
      isLaminated: true,
      isLowE: true,
      isTempered: true,
      isTripleGlazed: true,
      name: true,
      purpose: true,
      thicknessMm: true,
    },
  });

  console.log(`\nFound ${glassTypes.length} glass types\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  // Step 3: For each glass type, calculate and create solutions
  for (const glassType of glassTypes) {
    console.log(`Processing: ${glassType.name}`);

    // Calculate which solutions apply
    const assignments = calculateGlassSolutions({
      isLaminated: glassType.isLaminated,
      isLowE: glassType.isLowE,
      isTempered: glassType.isTempered,
      isTripleGlazed: glassType.isTripleGlazed,
      purpose: glassType.purpose,
      thicknessMm: glassType.thicknessMm,
    });

    console.log(`  Calculated ${assignments.length} solution(s)`);

    // Create each assignment
    for (const assignment of assignments) {
      const solutionId = solutionMap.get(assignment.solutionKey);

      if (!solutionId) {
        console.warn(`  ⚠️  Solution not found: ${assignment.solutionKey}`);
        failed++;
        continue;
      }

      // Check if already exists
      const existing = await prisma.glassTypeSolution.findUnique({
        where: {
          glassTypeId_solutionId: {
            glassTypeId: glassType.id,
            solutionId,
          },
        },
      });

      if (existing) {
        console.log(`  ⏭️  Already exists: ${assignment.solutionKey}`);
        skipped++;
        continue;
      }

      // Create new assignment
      const factoryResult = createGlassTypeSolution({
        glassTypeId: glassType.id,
        isPrimary: assignment.isPrimary,
        performanceRating: assignment.performanceRating,
        solutionId,
      });

      if (!(factoryResult.success && factoryResult.data)) {
        console.error(`  ❌ Validation failed: ${factoryResult.errors?.join(', ')}`);
        failed++;
        continue;
      }

      await prisma.glassTypeSolution.create({
        data: factoryResult.data,
      });

      console.log(
        `  ✅ Created: ${assignment.solutionKey} (${assignment.performanceRating}${assignment.isPrimary ? ', PRIMARY' : ''})`
      );
      created++;
    }

    console.log('');
  }

  console.log('=== Migration Complete ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${created + skipped + failed}\n`);
}

main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
