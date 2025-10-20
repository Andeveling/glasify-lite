#!/usr/bin/env tsx
/**
 * Check Glass Types Solutions Status
 *
 * Verifies if glass types have solutions assigned and shows statistics.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking Glass Types Solutions Status...\n');

  // Count total glass types
  const totalGlassTypes = await prisma.glassType.count();
  console.log(`📊 Total Glass Types: ${totalGlassTypes}`);

  // Count glass types with solutions
  const glassTypesWithSolutions = await prisma.glassType.count({
    where: {
      solutions: {
        some: {},
      },
    },
  });

  console.log(`✅ Glass Types WITH Solutions: ${glassTypesWithSolutions}`);

  // Count glass types WITHOUT solutions
  const glassTypesWithoutSolutions = totalGlassTypes - glassTypesWithSolutions;
  console.log(`❌ Glass Types WITHOUT Solutions: ${glassTypesWithoutSolutions}`);

  if (glassTypesWithoutSolutions > 0) {
    console.log('\n⚠️  WARNING: Some glass types have NO solutions assigned!');
    console.log('Run the seeder to fix this:');
    console.log('  pnpm db:seed\n');

    // List glass types without solutions
    const orphanGlassTypes = await prisma.glassType.findMany({
      select: {
        id: true,
        name: true,
        purpose: true,
      },
      where: {
        solutions: {
          none: {},
        },
      },
    });

    console.log('Glass types without solutions:');
    for (const gt of orphanGlassTypes) {
      console.log(`  - ${gt.name} (${gt.purpose})`);
    }
  } else {
    console.log('\n✅ All glass types have solutions assigned!');
  }

  // Count total solutions
  const totalSolutions = await prisma.glassSolution.count();
  console.log(`\n📊 Total Glass Solutions: ${totalSolutions}`);

  // Count glass type assignments
  const totalAssignments = await prisma.glassTypeSolution.count();
  console.log(`📊 Total Glass-Solution Assignments: ${totalAssignments}`);

  console.log('\n✅ Check complete!');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
