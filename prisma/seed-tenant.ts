/** biome-ignore-all lint/suspicious/noConsole: seed script requires console logging */
import { envSeed } from "../src/env-seed";
import { ConsoleSeederLogger } from "../src/lib/seeding/contracts/seeder.interface";
import { generateProfileSupplierBatch } from "../src/lib/seeding/factories/profile-supplier.factory";
import type { MaterialType } from "../src/lib/seeding/schemas/profile-supplier.schema";
import { ProfileSupplierSeeder } from "../src/lib/seeding/seeders/profile-supplier.seeder";
import { db } from "../src/server/db/drizzle";
import {
  createGlassCharacteristics,
  GLASS_CHARACTERISTIC_PRESETS,
} from "./factories/glass-characteristic.factory";
import {
  createGlassSuppliers,
  GLASS_SUPPLIER_PRESETS,
} from "./factories/glass-supplier.factory";

/**
 * TenantConfig Singleton - Business Configuration
 * Populated from environment variables (validated by src/env-seed.ts)
 *
 * The data comes from TENANT_* environment variables in .env file
 * Validation ensures all required fields are present and properly formatted
 */
const tenantConfigData = {
  businessAddress: envSeed.TENANT_BUSINESS_ADDRESS || undefined,
  businessName: envSeed.TENANT_BUSINESS_NAME,
  // Optional contact fields (undefined if not provided)
  contactEmail: envSeed.TENANT_CONTACT_EMAIL || undefined,
  contactPhone: envSeed.TENANT_CONTACT_PHONE || undefined,
  currency: envSeed.TENANT_CURRENCY,
  locale: envSeed.TENANT_LOCALE,
  quoteValidityDays: envSeed.TENANT_QUOTE_VALIDITY_DAYS,
  timezone: envSeed.TENANT_TIMEZONE,
} as const;

/**
 * ProfileSupplier Records - Window/Door Profile Manufacturers
 * These are the actual manufacturers (Rehau, Deceuninck, etc.)
 */
const profileSuppliers: Array<{
  isActive: boolean;
  materialType: MaterialType;
  name: string;
}> = [
  {
    isActive: true,
    materialType: "PVC",
    name: "Rehau",
  },
  {
    isActive: true,
    materialType: "PVC",
    name: "Deceuninck",
  },
  {
    isActive: true,
    materialType: "ALUMINUM",
    name: "Azembla",
  },
  {
    isActive: true,
    materialType: "ALUMINUM",
    name: "Aluflex",
  },
  {
    isActive: false,
    materialType: "PVC",
    name: "VEKA", // Inactive supplier example
  },
];

/**
 * Seed TenantConfig singleton
 */
async function seedTenantConfig(prisma: PrismaClient) {
  console.log(" Creating TenantConfig singleton...");

  const tenantConfig = await prisma.tenantConfig.upsert({
    create: tenantConfigData,
    update: tenantConfigData,
    where: { id: "1" }, // Singleton always has id = '1'
  });

  console.log(`✅ TenantConfig created: ${tenantConfig.businessName}`);
  console.log(`   Currency: ${tenantConfig.currency}`);
  console.log(`   Locale: ${tenantConfig.locale}`);
  console.log(`   Quote Validity: ${tenantConfig.quoteValidityDays} days`);
  console.log(`   Timezone: ${tenantConfig.timezone}`);
  if (tenantConfig.contactEmail) {
    console.log(`   Email: ${tenantConfig.contactEmail}`);
  }
  if (tenantConfig.contactPhone) {
    console.log(`   Phone: ${tenantConfig.contactPhone}`);
  }
  if (tenantConfig.businessAddress) {
    console.log(`   Address: ${tenantConfig.businessAddress}`);
  }

  return tenantConfig;
}

/**
 * Seed ProfileSupplier records
 *
 * This function runs BOTH Prisma (old) and Drizzle (new) seeders in parallel
 * to validate the migration works correctly without breaking existing functionality.
 */
async function seedProfileSuppliers(prisma: PrismaClient) {
  console.log("\n🏭 Creating profile suppliers...");

  // Initialize Drizzle seeder (cast to NodePgDatabase for local dev)
  const logger = new ConsoleSeederLogger();
  // biome-ignore lint/suspicious/noExplicitAny: MVP - db type union needs casting
  const drizzleSeeder = new ProfileSupplierSeeder(db as any, logger);

  // Generate data using new factory
  const factoryData = generateProfileSupplierBatch(profileSuppliers.length);

  // Run OLD Prisma seeder (keep existing functionality)
  const prismaSuppliers = await Promise.all(
    profileSuppliers.map((supplier) =>
      prisma.profileSupplier.upsert({
        create: supplier,
        update: supplier,
        where: { name: supplier.name },
      })
    )
  );

  console.log(
    `✅ [PRISMA] Created/updated ${prismaSuppliers.length} profile suppliers:`
  );
  for (const supplier of prismaSuppliers) {
    const status = supplier.isActive ? "✓" : "✗";
    console.log(`   ${status} ${supplier.name} (${supplier.materialType})`);
  }

  // Run NEW Drizzle seeder (parallel validation)
  console.log("\n🔄 [DRIZZLE] Running new seeder in parallel...");
  const drizzleResult = await drizzleSeeder.seed(factoryData);

  if (drizzleResult.success) {
    console.log(
      `✅ [DRIZZLE] Inserted: ${drizzleResult.inserted}, Updated: ${drizzleResult.updated}, Failed: ${drizzleResult.failed}`
    );
  } else {
    console.warn(
      `⚠️  [DRIZZLE] Seeder completed with ${drizzleResult.errors.length} errors:`
    );
    for (const error of drizzleResult.errors) {
      console.warn(`   - [${error.index}] ${error.error.message}`);
    }
  }

  return prismaSuppliers;
}

/**
 * Seed GlassSupplier records
 */
async function seedGlassSuppliers(prisma: PrismaClient) {
  console.log("\n🏭 Creating glass suppliers...");

  const glassSupplierData = Object.values(GLASS_SUPPLIER_PRESETS);
  const glassSupplierResults = createGlassSuppliers(glassSupplierData);
  const validGlassSuppliers = glassSupplierResults
    .filter((r) => r.success)
    .map((r) => r.data as NonNullable<typeof r.data>);

  const createdGlassSuppliers = await Promise.all(
    validGlassSuppliers.map((supplier) =>
      prisma.glassSupplier.upsert({
        create: supplier,
        update: supplier,
        where: { name: supplier.name },
      })
    )
  );

  console.log(
    `✅ Created/updated ${createdGlassSuppliers.length} glass suppliers:`
  );
  for (const supplier of createdGlassSuppliers) {
    const status = supplier.isActive ? "✓" : "✗";
    console.log(`   ${status} ${supplier.name} (${supplier.code || "N/A"})`);
  }

  return createdGlassSuppliers;
}

/**
 * Seed GlassCharacteristic records
 */
async function seedGlassCharacteristics(prisma: PrismaClient) {
  console.log("\n🔍 Creating glass characteristics...");

  const characteristicResults = createGlassCharacteristics(
    GLASS_CHARACTERISTIC_PRESETS
  );
  const validCharacteristics = characteristicResults
    .filter((r) => r.success)
    .map((r) => r.data as NonNullable<typeof r.data>);

  const createdCharacteristics = await Promise.all(
    validCharacteristics.map((characteristic) =>
      prisma.glassCharacteristic.upsert({
        create: characteristic,
        update: characteristic,
        where: { key: characteristic.key },
      })
    )
  );

  console.log(
    `✅ Created/updated ${createdCharacteristics.length} glass characteristics:`
  );
  const characteristicsByCategory = createdCharacteristics.reduce(
    (acc, char) => {
      if (!acc[char.category]) {
        acc[char.category] = [];
      }
      acc[char.category]?.push(char);
      return acc;
    },
    {} as Record<string, typeof createdCharacteristics>
  );

  for (const [category, chars] of Object.entries(characteristicsByCategory)) {
    console.log(`   📁 ${category}: ${chars.length} characteristics`);
    for (const char of chars) {
      const status = char.isActive ? "✓" : "✗";
      console.log(`      ${status} ${char.nameEs} (${char.key})`);
    }
  }

  return createdCharacteristics;
}

/**
 * Print tenant seed summary
 */
function printTenantSummary(
  createdProfileSuppliers: Awaited<ReturnType<typeof seedProfileSuppliers>>,
  createdGlassSuppliers: Awaited<ReturnType<typeof seedGlassSuppliers>>,
  createdCharacteristics: Awaited<ReturnType<typeof seedGlassCharacteristics>>
) {
  console.log("\n📊 Tenant Seed Summary:");
  console.log("   TenantConfig: 1 record (singleton)");
  console.log(`   ProfileSuppliers: ${createdProfileSuppliers.length} records`);
  console.log(
    `   Active Suppliers: ${createdProfileSuppliers.filter((s) => s.isActive).length}`
  );
  console.log(
    `   PVC Suppliers: ${createdProfileSuppliers.filter((s) => s.materialType === "PVC").length}`
  );
  console.log(
    `   ALUMINUM Suppliers: ${createdProfileSuppliers.filter((s) => s.materialType === "ALUMINUM").length}`
  );
  console.log(`   GlassSuppliers: ${createdGlassSuppliers.length} records`);
  console.log(
    `   GlassCharacteristics: ${createdCharacteristics.length} records`
  );
}

/**
 * Seed TenantConfig singleton and ProfileSupplier records
 *
 * This function ensures:
 * 1. Only ONE TenantConfig record exists (singleton pattern)
 * 2. ProfileSupplier records are created/updated with proper data
 * 3. Data is idempotent (safe to run multiple times)
 *
 * @param prisma - Prisma client instance
 */
export async function seedTenant(prisma: PrismaClient) {
  console.log("🔄 Seeding tenant configuration and profile suppliers...");

  const tenantConfig = await seedTenantConfig(prisma);
  const createdProfileSuppliers = await seedProfileSuppliers(prisma);
  const createdGlassSuppliers = await seedGlassSuppliers(prisma);
  const createdCharacteristics = await seedGlassCharacteristics(prisma);

  printTenantSummary(
    createdProfileSuppliers,
    createdGlassSuppliers,
    createdCharacteristics
  );

  return {
    characteristics: createdCharacteristics,
    glassSuppliers: createdGlassSuppliers,
    profileSuppliers: createdProfileSuppliers,
    tenantConfig,
  };
}
