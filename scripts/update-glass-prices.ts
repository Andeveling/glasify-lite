/**
 * Script to update glass type prices in database
 * Adds realistic Colombian market prices (COP per m²)
 *
 * Run with: pnpm tsx scripts/update-glass-prices.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const glassPrices: Record<string, number> = {
  // DVH (Doble Vidrio Hermético) - Insulated Glass (high range)
  DVH20: 90_000.0,
  DVH24: 110_000.0,
  DVH28: 130_000.0,

  // Especialidades
  GLASS6: 40_000.0,

  // Laminado - Security Glass (mid-high range)
  LAM6: 70_000.0,
  LAM8: 85_000.0,
  LAM10: 95_000.0,
  // Monolítico (Float/Crudo) - Basic Glass (economical)
  MONO4: 250_000.0,
  MONO6: 300_000.0,
  MONO8: 350_000.0,

  // Control Solar / Reflectivo (mid-high range)
  REFL6: 50_000.0,

  // Templado - Safety Glass (mid-range)
  TEMP6: 450_000.0,
  TEMP8: 550_000.0,
  TEMP10: 650_000.0,
  TEMP12: 750_000.0,
};

async function main() {
  console.log('🔄 Updating glass type prices...\n');

  let updated = 0;
  let errors = 0;

  for (const [code, price] of Object.entries(glassPrices)) {
    try {
      const result = await prisma.glassType.updateMany({
        data: {
          pricePerSqm: price,
        },
        where: {
          code,
        },
      });

      if (result.count > 0) {
        console.log(`✅ ${code}: $${price.toLocaleString('es-CO')} COP/m² (${result.count} record(s))`);
        updated += result.count;
      } else {
        console.log(`⚠️  ${code}: No records found`);
      }
    } catch (error) {
      console.error(`❌ ${code}: Error -`, error);
      errors++;
    }
  }

  // Update any remaining entries with 0 price to default
  const defaultPrice = 50_000.0;
  const defaultResult = await prisma.glassType.updateMany({
    data: {
      pricePerSqm: defaultPrice,
    },
    where: {
      pricePerSqm: 0,
    },
  });

  if (defaultResult.count > 0) {
    console.log(
      `\n✅ Updated ${defaultResult.count} entries with default price: $${defaultPrice.toLocaleString('es-CO')} COP/m²`
    );
    updated += defaultResult.count;
  }

  console.log(`\n✅ Done! Updated ${updated} glass type(s)`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} error(s) occurred`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
