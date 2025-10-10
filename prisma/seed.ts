/** biome-ignore-all lint/suspicious/noConsole: simplemente es un seed de prueba */
import { PrismaClient } from '@prisma/client';
import { seedGlassSolutions } from './seed-solutions';
import { seedTenant } from './seed-tenant';

const prisma = new PrismaClient();

const seedData = {
  glassTypes: [
    {
      name: 'Vidrio Templado 6mm',
      pricePerSqm: 65_000,
      purpose: 'security' as const,
      thicknessMm: 6,
    },
    {
      name: 'Vidrio Simple 4mm',
      pricePerSqm: 28_000,
      purpose: 'general' as const,
      thicknessMm: 4,
    },
    {
      name: 'Vidrio DVH 20mm',
      pricePerSqm: 120_000,
      purpose: 'insulation' as const,
      thicknessMm: 20,
    },
  ],
  models: [
    {
      accessoryPrice: 15_000,
      basePrice: 120_000,
      costPerMmHeight: 55,
      costPerMmWidth: 45,
      maxHeightMm: 1800,
      maxWidthMm: 2000,
      minHeightMm: 400,
      minWidthMm: 600,
      name: 'Ventana Corrediza Estándar',
      profileSupplierName: 'Rehau', // Will be linked to ProfileSupplier
      status: 'published' as const,
    },
    {
      accessoryPrice: 22_000,
      basePrice: 180_000,
      costPerMmHeight: 75,
      costPerMmWidth: 65,
      maxHeightMm: 1200,
      maxWidthMm: 1500,
      minHeightMm: 300,
      minWidthMm: 400,
      name: 'Ventana Proyectante Premium',
      profileSupplierName: 'Deceuninck', // Will be linked to ProfileSupplier
      status: 'published' as const,
    },
  ],
  services: [
    {
      name: 'Instalación',
      rate: 25_000,
      type: 'fixed' as const,
      unit: 'unit' as const,
    },
    {
      name: 'Sellado perimetral',
      rate: 1500,
      type: 'perimeter' as const,
      unit: 'ml' as const,
    },
    {
      name: 'Tratamiento superficie',
      rate: 8000,
      type: 'area' as const,
      unit: 'sqm' as const,
    },
  ],
};

const main = async () => {
  try {
    console.log('🌱 Seeding database...');

    // ==========================================
    // STEP 1: Seed TenantConfig and ProfileSuppliers
    // ==========================================
    const { tenantConfig, profileSuppliers } = await seedTenant(prisma);

    console.log(`\n✅ Tenant setup complete: ${tenantConfig.businessName} (${tenantConfig.currency})`);

    // ==========================================
    // STEP 2: Seed Glass Types (no manufacturer reference)
    // ==========================================
    const glassTypes = await Promise.all(
      seedData.glassTypes.map((glassData) =>
        prisma.glassType.create({
          data: glassData,
        })
      )
    );

    console.log(`✅ Created ${glassTypes.length} glass types`);

    // ==========================================
    // STEP 3: Seed Services (no manufacturer reference)
    // ==========================================
    const services = await Promise.all(
      seedData.services.map((serviceData) =>
        prisma.service.create({
          data: serviceData,
        })
      )
    );

    console.log(`✅ Created ${services.length} services`);

    // ==========================================
    // STEP 4: Seed Models with ProfileSupplier references
    // ==========================================
    const glassTypeIds = glassTypes.map((gt) => gt.id);
    const models = await Promise.all(
      seedData.models.map((modelData) => {
        // Find the ProfileSupplier by name
        const supplier = profileSuppliers.find((s) => s.name === modelData.profileSupplierName);
        if (!supplier) {
          throw new Error(`ProfileSupplier "${modelData.profileSupplierName}" not found`);
        }

        // Remove profileSupplierName before passing to Prisma (not a Model field)
        const { profileSupplierName: _unused, ...modelDataWithoutSupplierName } = modelData;

        return prisma.model.create({
          data: {
            ...modelDataWithoutSupplierName,
            compatibleGlassTypeIds: glassTypeIds,
            profileSupplierId: supplier.id,
          },
        });
      })
    );

    console.log(`✅ Created ${models.length} models`);

    console.log('\n🎉 Seed data created successfully!');
    console.log(`Tenant: ${tenantConfig.businessName} (${tenantConfig.currency})`);
    console.log(`Profile Suppliers: ${profileSuppliers.map((s) => s.name).join(', ')}`);
    console.log('Available models:', models.map((m) => `${m.name} (${m.id})`).join(', '));
    console.log('Available glass types:', glassTypes.map((gt) => `${gt.name} (${gt.id})`).join(', '));
    console.log('Available services:', services.map((s) => `${s.name} (${s.id})`).join(', '));

    // Seed glass solutions
    console.log('\n');
    await seedGlassSolutions(prisma);

    console.log('\n✨ All seed data completed!');
  } catch (error) {
    console.error('❌ Error seeding database:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
