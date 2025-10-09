/** biome-ignore-all lint/suspicious/noConsole: simplemente es un seed de prueba */
import { PrismaClient } from '@prisma/client';
import { seedGlassSolutions } from './seed-solutions';

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
  manufacturer: {
    currency: 'CLP',
    name: 'Vidrios del Norte',
    quoteValidityDays: 15,
  },
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

    const manufacturer = await prisma.manufacturer.create({
      data: seedData.manufacturer,
    });

    console.log(`✅ Created manufacturer: ${manufacturer.name} (${manufacturer.id})`);

    const glassTypes = await Promise.all(
      seedData.glassTypes.map((glassData) =>
        prisma.glassType.create({
          data: {
            ...glassData,
            manufacturerId: manufacturer.id,
          },
        })
      )
    );

    console.log(`✅ Created ${glassTypes.length} glass types`);

    const services = await Promise.all(
      seedData.services.map((serviceData) =>
        prisma.service.create({
          data: {
            ...serviceData,
            manufacturerId: manufacturer.id,
          },
        })
      )
    );

    console.log(`✅ Created ${services.length} services`);

    const glassTypeIds = glassTypes.map((gt) => gt.id);
    const models = await Promise.all(
      seedData.models.map((modelData) =>
        prisma.model.create({
          data: {
            ...modelData,
            compatibleGlassTypeIds: glassTypeIds,
            manufacturerId: manufacturer.id,
          },
        })
      )
    );

    console.log(`✅ Created ${models.length} models`);

    console.log('\n🎉 Seed data created successfully!');
    console.log(`Manufacturer ID: ${manufacturer.id}`);
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
