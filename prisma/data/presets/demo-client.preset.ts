/**
 * Demo Client Preset - Realistic Demo Configuration
 *
 * Use case: Client presentations, sales demos, realistic MVP showcase
 *
 * Contains:
 * - 10 diverse glass types (monolithic, tempered, laminated, DVH, Low-E)
 * - 4 active profile suppliers (mix of PVC and Aluminum)
 * - 6 window/door models (sliding, tilt&turn, casement)
 * - 10 common services (installation, finishing, accessories)
 * - 6 glass solutions (all categories)
 *
 * Data represents a realistic Colombian window business catalog
 *
 * @version 1.0.0
 */

import type { GlassTypeInput } from '../../factories/glass-type.factory';
import type { ModelInput } from '../../factories/model.factory';
import type { ProfileSupplierInput } from '../../factories/profile-supplier.factory';
import type { ServiceInput } from '../../factories/service.factory';
import {
  decorativeSolution,
  energyEfficiencySolution,
  generalPurposeSolution,
  securitySolution,
  soundInsulationSolution,
  thermalInsulationSolution,
} from '../catalog/glass-solutions.catalog';
import {
  aluminaKoncept50,
  aluminaKoncept70,
  aluminaSuperior50,
  deceuninckElegantBatiente,
  deceuninckInouticS5500,
  deceuninckZendowS4100,
} from '../catalog/models.catalog';
import {
  advancedWaterproofing,
  aluminumAnodizing,
  glassReplacement,
  hardwareAdjustment,
  mosquitoScreen,
  oldWindowRemoval,
  perimeterSealing,
  premiumInstallation,
  safetyFilm,
  standardInstallation,
} from '../catalog/services.catalog';

// ==========================================
// GLASS TYPES (10 diverse types)
// ==========================================

/**
 * Diverse glass types for realistic demos
 */
export const demoGlassTypes: GlassTypeInput[] = [
  // Monolithic
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Monolítico 4mm',
    pricePerSqm: 28_000,
    purpose: 'general',
    thicknessMm: 4,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Monolítico 6mm',
    pricePerSqm: 35_000,
    purpose: 'general',
    thicknessMm: 6,
  },
  // Tempered
  {
    isLaminated: false,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado 6mm',
    pricePerSqm: 65_000,
    purpose: 'security',
    thicknessMm: 6,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado 10mm',
    pricePerSqm: 95_000,
    purpose: 'security',
    thicknessMm: 10,
  },
  // Laminated
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado 6mm (3+3)',
    pricePerSqm: 85_000,
    purpose: 'security',
    thicknessMm: 6,
  },
  {
    isLaminated: true,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado + Laminado 10mm (5+5)',
    pricePerSqm: 145_000,
    purpose: 'security',
    thicknessMm: 10,
  },
  // DVH (Double Glazing)
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH 20mm (6-8-6)',
    pricePerSqm: 110_000,
    purpose: 'insulation',
    thicknessMm: 20,
    uValue: 3.0,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH 24mm (6-12-6)',
    pricePerSqm: 120_000,
    purpose: 'insulation',
    thicknessMm: 24,
    uValue: 2.8,
  },
  // Low-E
  {
    isLaminated: false,
    isLowE: true,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH Low-E 24mm (6-12-6)',
    pricePerSqm: 165_000,
    purpose: 'insulation',
    thicknessMm: 24,
    uValue: 1.8,
  },
  {
    isLaminated: false,
    isLowE: true,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH Low-E 28mm (6-16-6)',
    pricePerSqm: 180_000,
    purpose: 'insulation',
    thicknessMm: 28,
    uValue: 1.6,
  },
];

// ==========================================
// PROFILE SUPPLIERS (4 active)
// ==========================================

/**
 * Realistic mix of profile suppliers
 */
export const demoProfileSuppliers: ProfileSupplierInput[] = [
  {
    isActive: true,
    materialType: 'PVC',
    name: 'Deceuninck',
    notes: 'Premium PVC profiles from Belgium. High thermal efficiency, multi-chamber system.',
  },
  {
    isActive: true,
    materialType: 'PVC',
    name: 'Rehau',
    notes: 'German PVC manufacturer. Excellent UV resistance for tropical climates.',
  },
  {
    isActive: true,
    materialType: 'ALUMINUM',
    name: 'Alumina',
    notes: 'Colombian aluminum manufacturer. Local production, competitive pricing.',
  },
  {
    isActive: true,
    materialType: 'ALUMINUM',
    name: 'Sistemas Europeos',
    notes: 'High-end aluminum systems. Thermal break technology, commercial projects.',
  },
];

// ==========================================
// MODELS (6 window/door models)
// ==========================================

/**
 * Realistic window/door models for demos
 * Imported from catalog
 */
export const demoModels: ModelInput[] = [
  deceuninckInouticS5500, // Premium sliding
  deceuninckZendowS4100, // Standard sliding
  deceuninckElegantBatiente, // Casement
  aluminaKoncept70, // Aluminum sliding
  aluminaKoncept50, // Aluminum window
  aluminaSuperior50, // Budget aluminum
];

// ==========================================
// SERVICES (10 common services)
// ==========================================

/**
 * Common services for realistic demos
 * Imported from catalog
 */
export const demoServices: ServiceInput[] = [
  standardInstallation,
  premiumInstallation,
  perimeterSealing,
  advancedWaterproofing,
  aluminumAnodizing,
  safetyFilm,
  mosquitoScreen,
  oldWindowRemoval,
  hardwareAdjustment,
  glassReplacement,
];

// ==========================================
// GLASS SOLUTIONS (6 all categories)
// ==========================================

/**
 * All glass solution categories
 * Imported from catalog
 */
export const demoGlassSolutions = [
  securitySolution,
  thermalInsulationSolution,
  soundInsulationSolution,
  energyEfficiencySolution,
  decorativeSolution,
  generalPurposeSolution,
];

// ==========================================
// PRESET EXPORT
// ==========================================

/**
 * Demo client preset configuration
 */
export const demoClientPreset = {
  description: 'Configuración realista para demostraciones con clientes y presentaciones comerciales',
  glassSolutions: demoGlassSolutions,
  glassTypes: demoGlassTypes,
  models: demoModels,
  name: 'demo-client',
  profileSuppliers: demoProfileSuppliers,
  services: demoServices,
  stats: {
    glassSolutions: demoGlassSolutions.length,
    glassTypes: demoGlassTypes.length,
    models: demoModels.length,
    profileSuppliers: demoProfileSuppliers.length,
    services: demoServices.length,
    total:
      demoGlassTypes.length +
      demoProfileSuppliers.length +
      demoModels.length +
      demoServices.length +
      demoGlassSolutions.length,
  },
  useCases: [
    'Client presentations showing realistic product catalog',
    'Sales demos with diverse pricing tiers',
    'MVP showcase for investors',
    'Training new sales team members',
  ],
} as const;
