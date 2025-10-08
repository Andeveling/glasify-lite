import '@testing-library/jest-dom';
import { afterAll, beforeAll, vi } from 'vitest';
import { db } from '@/server/db';

// Mock ResizeObserver for jsdom environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

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
    currency: 'COP',
    id: 'cm1manufacturer123456789ab',
    name: 'Cristales Modernos',
    quoteValidityDays: 30,
  },
  {
    currency: 'COP',
    id: 'cm1abc123def456ghi789jkl0',
    name: 'Ventanas Andinas',
    quoteValidityDays: 20,
  },
];

const BASE_GLASS_TYPES: readonly GlassTypeSeed[] = [
  {
    id: 'cm1glass123def456ghi789jkl',
    isLaminated: true,
    isTempered: true,
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Vidrio Laminado 6mm',
    pricePerSqm: '185000.00',
    purpose: 'security',
    thicknessMm: 6,
  },
  {
    id: 'cm1glasstype123456789abc1',
    isTempered: true,
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Vidrio Templado 8mm',
    pricePerSqm: '210000.00',
    purpose: 'security',
    thicknessMm: 8,
  },
  {
    id: 'cm1glasstype123456789abc2',
    isLowE: true,
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Vidrio Bajo Emisivo 6mm',
    pricePerSqm: '240000.00',
    purpose: 'insulation',
    thicknessMm: 6,
  },
  {
    id: 'cm1catalogglasstype123456789',
    manufacturerId: 'cm1abc123def456ghi789jkl0',
    name: 'Vidrio Aislante 6mm',
    pricePerSqm: '190000.00',
    purpose: 'insulation',
    thicknessMm: 6,
  },
];

const BASE_SERVICES: readonly ServiceSeed[] = [
  {
    id: 'cm1service123def456ghi789',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Instalación profesional',
    rate: '75000.0000',
    type: 'fixed',
    unit: 'unit',
  },
  {
    id: 'cm1service1def456ghi789',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Sellado perimetral premium',
    rate: '15000.0000',
    type: 'perimeter',
    unit: 'ml',
  },
  {
    id: 'cm1service2def456ghi789',
    manufacturerId: 'cm1manufacturer123456789ab',
    name: 'Transporte especializado',
    rate: '25000.0000',
    type: 'area',
    unit: 'sqm',
  },
];

const BASE_MODELS: readonly ModelSeed[] = [
  {
    accessoryPrice: '45000.00',
    basePrice: '285000.00',
    compatibleGlassTypeIds: ['cm1glass123def456ghi789jkl', 'cm1glasstype123456789abc1'],
    costPerMmHeight: '110.0000',
    costPerMmWidth: '120.0000',
    glassDiscountHeightMm: 10,
    glassDiscountWidthMm: 10,
    id: 'cm1model123def456ghi789jkl',
    manufacturerId: 'cm1manufacturer123456789ab',
    maxHeightMm: 2100,
    maxWidthMm: 2000,
    minHeightMm: 500,
    minWidthMm: 600,
    name: 'Ventana Termoacústica Elite',
    status: 'published',
  },
  {
    accessoryPrice: '50000.00',
    basePrice: '320000.00',
    compatibleGlassTypeIds: ['cm1catalogglasstype123456789'],
    costPerMmHeight: '125.0000',
    costPerMmWidth: '130.0000',
    id: 'cm1catalogmodelpublished123',
    manufacturerId: 'cm1abc123def456ghi789jkl0',
    maxHeightMm: 2200,
    maxWidthMm: 2400,
    minHeightMm: 700,
    minWidthMm: 800,
    name: 'Ventana Panorama 2024',
    status: 'published',
  },
  {
    accessoryPrice: null,
    basePrice: '260000.00',
    compatibleGlassTypeIds: ['cm1catalogglasstype123456789'],
    costPerMmHeight: '100.0000',
    costPerMmWidth: '95.0000',
    id: 'cm1catalogmodeldraft123',
    manufacturerId: 'cm1abc123def456ghi789jkl0',
    maxHeightMm: 2000,
    maxWidthMm: 2000,
    minHeightMm: 600,
    minWidthMm: 600,
    name: 'Ventana Minimal Draft',
    status: 'draft',
  },
];

const seedManufacturers = async () => {
  for (const manufacturer of BASE_MANUFACTURERS) {
    await db.manufacturer.upsert({
      create: manufacturer,
      update: {
        currency: manufacturer.currency,
        name: manufacturer.name,
        quoteValidityDays: manufacturer.quoteValidityDays,
      },
      where: { id: manufacturer.id },
    });
  }
};

const buildGlassTypeData = (glassType: GlassTypeSeed) => ({
  isLaminated: glassType.isLaminated ?? false,
  isLowE: glassType.isLowE ?? false,
  isTempered: glassType.isTempered ?? false,
  isTripleGlazed: glassType.isTripleGlazed ?? false,
  manufacturerId: glassType.manufacturerId,
  name: glassType.name,
  pricePerSqm: glassType.pricePerSqm,
  purpose: glassType.purpose,
  thicknessMm: glassType.thicknessMm,
  uValue: glassType.uValue ?? null,
});

const seedGlassTypes = async () => {
  for (const glassType of BASE_GLASS_TYPES) {
    const data = buildGlassTypeData(glassType);

    await db.glassType.upsert({
      create: { id: glassType.id, ...data },
      update: data,
      where: { id: glassType.id },
    });
  }
};

const seedServices = async () => {
  for (const service of BASE_SERVICES) {
    await db.service.upsert({
      create: service,
      update: {
        manufacturerId: service.manufacturerId,
        name: service.name,
        rate: service.rate,
        type: service.type,
        unit: service.unit,
      },
      where: { id: service.id },
    });
  }
};

const buildModelData = (model: ModelSeed) => ({
  accessoryPrice: model.accessoryPrice,
  basePrice: model.basePrice,
  costPerMmHeight: model.costPerMmHeight,
  costPerMmWidth: model.costPerMmWidth,
  glassDiscountHeightMm: model.glassDiscountHeightMm ?? 0,
  glassDiscountWidthMm: model.glassDiscountWidthMm ?? 0,
  manufacturerId: model.manufacturerId,
  maxHeightMm: model.maxHeightMm,
  maxWidthMm: model.maxWidthMm,
  minHeightMm: model.minHeightMm,
  minWidthMm: model.minWidthMm,
  name: model.name,
  status: model.status,
});

const seedModels = async () => {
  for (const model of BASE_MODELS) {
    const compatibilityIds = Array.from(model.compatibleGlassTypeIds);
    const baseData = buildModelData(model);

    await db.model.upsert({
      create: {
        id: model.id,
        ...baseData,
        compatibleGlassTypeIds: compatibilityIds,
      },
      update: {
        ...baseData,
        compatibleGlassTypeIds: { set: compatibilityIds },
      },
      where: { id: model.id },
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
