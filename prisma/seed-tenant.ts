/** biome-ignore-all lint/suspicious/noConsole: seed script requires console logging */
import type { MaterialType, PrismaClient } from '@prisma/client';
import { envSeed } from '../src/env-seed';
import { createGlassCharacteristics, GLASS_CHARACTERISTIC_PRESETS } from './factories/glass-characteristic.factory';
import { createGlassSuppliers, GLASS_SUPPLIER_PRESETS } from './factories/glass-supplier.factory';

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
      materialType: 'PVC',
      name: 'Rehau',
    },
    {
      isActive: true,
      materialType: 'PVC',
      name: 'Deceuninck',
    },
    {
      isActive: true,
      materialType: 'ALUMINUM',
      name: 'Azembla',
    },
    {
      isActive: true,
      materialType: 'ALUMINUM',
      name: 'Aluflex',
    },
    {
      isActive: false,
      materialType: 'PVC',
      name: 'VEKA', // Inactive supplier example
    },
  ];

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
  console.log('🔄 Seeding tenant configuration and profile suppliers...');

  // ==========================================
  // STEP 1: Create/Update TenantConfig Singleton
  // ==========================================
  console.log('📋 Creating TenantConfig singleton...');

  const tenantConfig = await prisma.tenantConfig.upsert({
    create: tenantConfigData,
    update: tenantConfigData,
    where: { id: '1' }, // Singleton always has id = '1'
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

  // ==========================================
  // STEP 2: Create/Update ProfileSupplier Records
  // ==========================================
  console.log('\n🏭 Creating profile suppliers...');

  const createdSuppliers = await Promise.all(
    profileSuppliers.map((supplier) =>
      prisma.profileSupplier.upsert({
        create: supplier,
        update: supplier,
        where: { name: supplier.name },
      })
    )
  );

  console.log(`✅ Created/updated ${createdSuppliers.length} profile suppliers:`);
  for (const supplier of createdSuppliers) {
    const status = supplier.isActive ? '✓' : '✗';
    console.log(`   ${status} ${supplier.name} (${supplier.materialType})`);
  }

  // ==========================================
  // STEP 3: Summary Statistics
  // ==========================================
  console.log('\n📊 Tenant Seed Summary:');
  console.log('   TenantConfig: 1 record (singleton)');
  console.log(`   ProfileSuppliers: ${createdSuppliers.length} records`);
  console.log(`   Active Suppliers: ${createdSuppliers.filter((s) => s.isActive).length}`);
  console.log(`   PVC Suppliers: ${createdSuppliers.filter((s) => s.materialType === 'PVC').length}`);
  console.log(`   ALUMINUM Suppliers: ${createdSuppliers.filter((s) => s.materialType === 'ALUMINUM').length}`);

  // ==========================================
  // STEP 4: Create/Update GlassSupplier Records
  // ==========================================
  console.log('\n🏭 Creating glass suppliers...');

  const glassSupplierData = Object.values(GLASS_SUPPLIER_PRESETS);
  const glassSupplierResults = createGlassSuppliers(glassSupplierData);
  const validGlassSuppliers = glassSupplierResults.filter((r) => r.success).map((r) => r.data!);

  const createdGlassSuppliers = await Promise.all(
    validGlassSuppliers.map((supplier) =>
      prisma.glassSupplier.upsert({
        create: supplier,
        update: supplier,
        where: { name: supplier.name },
      })
    )
  );

  console.log(`✅ Created/updated ${createdGlassSuppliers.length} glass suppliers:`);
  for (const supplier of createdGlassSuppliers) {
    const status = supplier.isActive ? '✓' : '✗';
    console.log(`   ${status} ${supplier.name} (${supplier.code || 'N/A'})`);
  }

  // ==========================================
  // STEP 5: Create/Update GlassCharacteristic Records
  // ==========================================
  console.log('\n🔍 Creating glass characteristics...');

  const characteristicResults = createGlassCharacteristics(GLASS_CHARACTERISTIC_PRESETS);
  const validCharacteristics = characteristicResults.filter((r) => r.success).map((r) => r.data!);

  const createdCharacteristics = await Promise.all(
    validCharacteristics.map((characteristic) =>
      prisma.glassCharacteristic.upsert({
        create: characteristic,
        update: characteristic,
        where: { key: characteristic.key },
      })
    )
  );

  console.log(`✅ Created/updated ${createdCharacteristics.length} glass characteristics:`);
  const characteristicsByCategory = createdCharacteristics.reduce(
    (acc, char) => {
      if (!acc[ char.category ]) {
        acc[ char.category ] = [];
      }
      acc[ char.category ]!.push(char);
      return acc;
    },
    {} as Record<string, typeof createdCharacteristics>
  );

  for (const [ category, chars ] of Object.entries(characteristicsByCategory)) {
    console.log(`   📁 ${category}: ${chars.length} characteristics`);
    for (const char of chars) {
      const status = char.isActive ? '✓' : '✗';
      console.log(`      ${status} ${char.nameEs} (${char.key})`);
    }
  }

  // ==========================================
  // STEP 6: Updated Summary Statistics
  // ==========================================
  console.log('\n📊 Tenant Seed Summary:');
  console.log('   TenantConfig: 1 record (singleton)');
  console.log(`   ProfileSuppliers: ${createdSuppliers.length} records`);
  console.log(`   Active Suppliers: ${createdSuppliers.filter((s) => s.isActive).length}`);
  console.log(`   PVC Suppliers: ${createdSuppliers.filter((s) => s.materialType === 'PVC').length}`);
  console.log(`   ALUMINUM Suppliers: ${createdSuppliers.filter((s) => s.materialType === 'ALUMINUM').length}`);
  console.log(`   GlassSuppliers: ${createdGlassSuppliers.length} records`);
  console.log(`   GlassCharacteristics: ${createdCharacteristics.length} records`);

  return {
    characteristics: createdCharacteristics,
    glassSuppliers: createdGlassSuppliers,
    profileSuppliers: createdSuppliers,
    tenantConfig,
  };
}
