/** biome-ignore-all lint/suspicious/noConsole: simplemente es un seed de prueba */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedData = {
  manufacturer: {
    name: "Vidrios del Norte",
    currency: "CLP",
    quoteValidityDays: 15,
  },
  glassTypes: [
    {
      name: "Vidrio Templado 6mm",
      purpose: "security" as const,
      thicknessMm: 6,
    },
    {
      name: "Vidrio Simple 4mm",
      purpose: "general" as const,
      thicknessMm: 4,
    },
    {
      name: "Vidrio DVH 20mm",
      purpose: "insulation" as const,
      thicknessMm: 20,
    },
  ],
  services: [
    {
      name: "Instalación",
      type: "fixed" as const,
      unit: "unit" as const,
      rate: 25_000,
    },
    {
      name: "Sellado perimetral",
      type: "perimeter" as const,
      unit: "ml" as const,
      rate: 1500,
    },
    {
      name: "Tratamiento superficie",
      type: "area" as const,
      unit: "sqm" as const,
      rate: 8000,
    },
  ],
  models: [
    {
      name: "Ventana Corrediza Estándar",
      status: "published" as const,
      minWidthMm: 600,
      maxWidthMm: 2000,
      minHeightMm: 400,
      maxHeightMm: 1800,
      basePrice: 120_000,
      costPerMmWidth: 45,
      costPerMmHeight: 55,
      accessoryPrice: 15_000,
    },
    {
      name: "Ventana Proyectante Premium",
      status: "published" as const,
      minWidthMm: 400,
      maxWidthMm: 1500,
      minHeightMm: 300,
      maxHeightMm: 1200,
      basePrice: 180_000,
      costPerMmWidth: 65,
      costPerMmHeight: 75,
      accessoryPrice: 22_000,
    },
  ],
};

const main = async () => {
  try {
    console.log("🌱 Seeding database...");

    const manufacturer = await prisma.manufacturer.create({
      data: seedData.manufacturer,
    });

    console.log(
      `✅ Created manufacturer: ${manufacturer.name} (${manufacturer.id})`
    );

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
            manufacturerId: manufacturer.id,
            compatibleGlassTypeIds: glassTypeIds,
          },
        })
      )
    );

    console.log(`✅ Created ${models.length} models`);

    console.log("\n🎉 Seed data created successfully!");
    console.log(`Manufacturer ID: ${manufacturer.id}`);
    console.log(
      "Available models:",
      models.map((m) => `${m.name} (${m.id})`).join(", ")
    );
    console.log(
      "Available glass types:",
      glassTypes.map((gt) => `${gt.name} (${gt.id})`).join(", ")
    );
    console.log(
      "Available services:",
      services.map((s) => `${s.name} (${s.id})`).join(", ")
    );
  } catch (error) {
    console.error("❌ Error seeding database:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
