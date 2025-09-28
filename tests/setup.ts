import '@testing-library/jest-dom';
import { afterAll, beforeAll, vi } from 'vitest';
import { db } from '@/server/db';

// Mock NextAuth for testing environment
vi.mock('@/server/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}));

type ManufacturerSeed = {
  readonly id: string;
  readonly name: string;
  readonly currency: string;
  readonly quoteValidityDays: number;
};

type GlassTypeSeed = {
  readonly id: string;
  readonly manufacturerId: string;
  readonly name: string;
  readonly purpose: 'general' | 'insulation' | 'security' | 'decorative';
  readonly thicknessMm: number;
  readonly pricePerSqm: string;
  readonly uValue?: string | null;
  readonly isTempered?: boolean;
  readonly isLaminated?: boolean;
  readonly isLowE?: boolean;
  readonly isTripleGlazed?: boolean;
};

type ServiceSeed = {
  readonly id: string;
  readonly manufacturerId: string;
  readonly name: string;
  readonly type: 'area' | 'perimeter' | 'fixed';
  readonly unit: 'unit' | 'sqm' | 'ml';
  readonly rate: string;
};

type ModelSeed = {
  readonly id: string;
  readonly manufacturerId: string;
  readonly name: string;
  readonly status: 'draft' | 'published';
  readonly minWidthMm: number;
  readonly maxWidthMm: number;
  readonly minHeightMm: number;
  readonly maxHeightMm: number;
  readonly basePrice: string;
  readonly costPerMmWidth: string;
  readonly costPerMmHeight: string;
  readonly accessoryPrice: string | null;
  readonly compatibleGlassTypeIds: readonly string[];
  readonly glassDiscountWidthMm?: number;
  readonly glassDiscountHeightMm?: number;
};

const BASE_MANUFACTURERS: readonly ManufacturerSeed[] = [
  {
    id: 'cm1manufacturer123456789ab',
    name: 'Cristales Modernos',
    currency: 'COP',
    quoteValidityDays: 30,
  },
  {
    id: 'cm1abc123def456ghi789jkl0',
    name: 'Ventanas Andinas',
    currency: 'COP',
    quoteValidityDays: 20,
  },
];

const BASE_GLASS_TYPES: readonly GlassTypeSeed[] = [
  {
    id: 'cm1glass123def456ghi789jkl',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Vidrio Laminado 6mm',
    purpose: 'security',
    thicknessMm: 6,
    pricePerSqm: '185000.00',
    isTempered: true,
    isLaminated: true,
  },
  {
    id: 'cm1glasstype123456789abc1',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Vidrio Templado 8mm',
    purpose: 'security',
    thicknessMm: 8,
    pricePerSqm: '210000.00',
    isTempered: true,
  },
  {
    id: 'cm1glasstype123456789abc2',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Vidrio Bajo Emisivo 6mm',
    purpose: 'insulation',
    thicknessMm: 6,
    pricePerSqm: '240000.00',
    isLowE: true,
  },
  {
    id: 'cm1catalogglasstype123456789',
    manufacturerId: 'cm1abc123def456ghi789jkl0',
    name: 'Vidrio Aislante 6mm',
    purpose: 'insulation',
    thicknessMm: 6,
    pricePerSqm: '190000.00',
  },
];

const BASE_SERVICES: readonly ServiceSeed[] = [
  {
    id: 'cm1service123def456ghi789',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Instalación profesional',
    type: 'fixed',
    unit: 'unit',
    rate: '75000.0000',
  },
  {
    id: 'cm1service1def456ghi789',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Sellado perimetral premium',
    type: 'perimeter',
    unit: 'ml',
    rate: '15000.0000',
  },
  {
    id: 'cm1service2def456ghi789',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Transporte especializado',
    type: 'area',
    unit: 'sqm',
    rate: '25000.0000',
  },
];

const BASE_MODELS: readonly ModelSeed[] = [
  {
    id: 'cm1model123def456ghi789jkl',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Ventana Termoacústica Elite',
    status: 'published',
    minWidthMm: 600,
    maxWidthMm: 2000,
    minHeightMm: 500,
    maxHeightMm: 2100,
    basePrice: '285000.00',
    costPerMmWidth: '120.0000',
    costPerMmHeight: '110.0000',
    accessoryPrice: '45000.00',
    compatibleGlassTypeIds: ['cm1glass123def456ghi789jkl', 'cm1glasstype123456789abc1'],
    glassDiscountWidthMm: 10,
    glassDiscountHeightMm: 10,
  },
  {
    id: 'cm1catalogmodelpublished123',
    manufacturerId: 'cm1abc123def456ghi789jkl0',
    name: 'Ventana Panorama 2024',
    status: 'published',
    minWidthMm: 800,
    maxWidthMm: 2400,
    minHeightMm: 700,
    maxHeightMm: 2200,
    basePrice: '320000.00',
    costPerMmWidth: '130.0000',
    costPerMmHeight: '125.0000',
    accessoryPrice: '50000.00',
    compatibleGlassTypeIds: ['cm1catalogglasstype123456789'],
  },
  {
    id: 'cm1catalogmodeldraft123',
    manufacturerId: 'cm1abc123def456ghi789jkl0',
    name: 'Ventana Minimal Draft',
    status: 'draft',
    minWidthMm: 600,
    maxWidthMm: 2000,
    minHeightMm: 600,
    maxHeightMm: 2000,
    basePrice: '260000.00',
    costPerMmWidth: '95.0000',
    costPerMmHeight: '100.0000',
    accessoryPrice: null,
    compatibleGlassTypeIds: ['cm1catalogglasstype123456789'],
  },
];

const seedManufacturers = async () => {
  for (const manufacturer of BASE_MANUFACTURERS) {
    await db.manufacturer.upsert({
      where: { id: manufacturer.id },
      update: {
        name: manufacturer.name,
        currency: manufacturer.currency,
        quoteValidityDays: manufacturer.quoteValidityDays,
      },
      create: manufacturer,
    });
  }
};

const buildGlassTypeData = (glassType: GlassTypeSeed) => ({
  manufacturerId: glassType.manufacturerId,
  name: glassType.name,
  purpose: glassType.purpose,
  thicknessMm: glassType.thicknessMm,
  pricePerSqm: glassType.pricePerSqm,
  uValue: glassType.uValue ?? null,
  isTempered: glassType.isTempered ?? false,
  isLaminated: glassType.isLaminated ?? false,
  isLowE: glassType.isLowE ?? false,
  isTripleGlazed: glassType.isTripleGlazed ?? false,
});

const seedGlassTypes = async () => {
  for (const glassType of BASE_GLASS_TYPES) {
    const data = buildGlassTypeData(glassType);

    await db.glassType.upsert({
      where: { id: glassType.id },
      update: data,
      create: { id: glassType.id, ...data },
    });
  }
};

const seedServices = async () => {
  for (const service of BASE_SERVICES) {
    await db.service.upsert({
      where: { id: service.id },
      update: {
        manufacturerId: service.manufacturerId,
        name: service.name,
        type: service.type,
        unit: service.unit,
        rate: service.rate,
      },
      create: service,
    });
  }
};

const buildModelData = (model: ModelSeed) => ({
  manufacturerId: model.manufacturerId,
  name: model.name,
  status: model.status,
  minWidthMm: model.minWidthMm,
  maxWidthMm: model.maxWidthMm,
  minHeightMm: model.minHeightMm,
  maxHeightMm: model.maxHeightMm,
  basePrice: model.basePrice,
  costPerMmWidth: model.costPerMmWidth,
  costPerMmHeight: model.costPerMmHeight,
  accessoryPrice: model.accessoryPrice,
  glassDiscountWidthMm: model.glassDiscountWidthMm ?? 0,
  glassDiscountHeightMm: model.glassDiscountHeightMm ?? 0,
});

const seedModels = async () => {
  for (const model of BASE_MODELS) {
    const compatibilityIds = Array.from(model.compatibleGlassTypeIds);
    const baseData = buildModelData(model);

    await db.model.upsert({
      where: { id: model.id },
      update: {
        ...baseData,
        compatibleGlassTypeIds: { set: compatibilityIds },
      },
      create: {
        id: model.id,
        ...baseData,
        compatibleGlassTypeIds: compatibilityIds,
      },
    });
  }
};

const cleanDatabase = async () => {
  await db.$transaction([
    db.quoteItemService.deleteMany(),
    db.adjustment.deleteMany(),
    db.quoteItem.deleteMany(),
    db.quote.deleteMany(),
    db.model.deleteMany(),
    db.glassType.deleteMany(),
    db.service.deleteMany(),
    db.manufacturer.deleteMany(),
  ]);
};

const seedBaseData = async () => {
  await cleanDatabase();
  await seedManufacturers();
  await seedGlassTypes();
  await seedServices();
  await seedModels();
};

const globalSeedState = globalThis as { __glasifySeedPromise?: Promise<void> };

const ensureSeeded = async () => {
  if (!globalSeedState.__glasifySeedPromise) {
    globalSeedState.__glasifySeedPromise = seedBaseData();
  }

  await globalSeedState.__glasifySeedPromise;
};

beforeAll(async () => {
  await ensureSeeded();
});

afterAll(async () => {
  await db.$disconnect();
});
