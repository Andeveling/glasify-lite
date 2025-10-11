/**
 * Full Catalog Preset - Complete Market Data
 *
 * Use case: Production database, full feature testing, comprehensive catalog
 *
 * Contains:
 * - 21 glass types (all catalog: monolithic, tempered, laminated, DVH, Low-E, specialty)
 * - 7 profile suppliers (Deceuninck, Rehau, VEKA, Alumina, etc.)
 * - 10 window/door models (all Deceuninck and Alumina series)
 * - 19 services (complete service catalog)
 * - 6 glass solutions (all categories)
 *
 * This is the most complete dataset representing the full Colombian market
 *
 * @version 1.0.0
 */

import type { GlassTypeInput } from '../../factories/glass-type.factory';
import type { ModelInput } from '../../factories/model.factory';
import type { ProfileSupplierInput } from '../../factories/profile-supplier.factory';
import type { ServiceInput } from '../../factories/service.factory';
import { glassSolutionsCatalog } from '../catalog/glass-solutions.catalog';
import { glassTypesCatalog } from '../catalog/glass-types.catalog';
import { modelsCatalog } from '../catalog/models.catalog';
import { profileSuppliersCatalog } from '../catalog/profile-suppliers.catalog';
import { servicesCatalog } from '../catalog/services.catalog';

// ==========================================
// FULL CATALOG DATA
// ==========================================

/**
 * All glass types from catalog
 */
export const fullGlassTypes: GlassTypeInput[] = glassTypesCatalog;

/**
 * All profile suppliers from catalog
 */
export const fullProfileSuppliers: ProfileSupplierInput[] = profileSuppliersCatalog;

/**
 * All models from catalog
 */
export const fullModels: ModelInput[] = modelsCatalog;

/**
 * All services from catalog
 */
export const fullServices: ServiceInput[] = servicesCatalog;

/**
 * All glass solutions from catalog
 */
export const fullGlassSolutions = glassSolutionsCatalog;

// ==========================================
// PRESET EXPORT
// ==========================================

/**
 * Full catalog preset configuration
 */
export const fullCatalogPreset = {
  coverage: {
    glassCategories: [
      'Monolithic (4mm-8mm)',
      'Tempered (6mm-12mm)',
      'Laminated (6mm-10mm)',
      'Double Glazing (20mm-28mm)',
      'Low-E coated',
      'Solar control',
      'Acoustic specialty',
    ],
    profileMaterials: ['PVC (Premium European)', 'Aluminum (Local & Imported)', 'Wood (Limited)'],
    serviceCategories: [
      'Installation (standard/premium/high-rise)',
      'Sealing & waterproofing',
      'Surface treatments',
      'Glass treatments & films',
      'Hardware & accessories',
      'Demolition & removal',
      'Maintenance & repair',
    ],
    solutionCategories: [
      'Security & safety',
      'Thermal insulation',
      'Sound insulation',
      'Energy efficiency',
      'Decorative & privacy',
      'General purpose',
    ],
    suppliers: {
      aluminum: ['Alumina', 'Sistemas Europeos', 'Aluminio Económico'],
      pvc: ['Deceuninck', 'Rehau', 'VEKA'],
    },
  },
  description: 'Catálogo completo con todos los datos del mercado colombiano disponibles',
  glassSolutions: fullGlassSolutions,
  glassTypes: fullGlassTypes,
  models: fullModels,
  name: 'full-catalog',
  profileSuppliers: fullProfileSuppliers,
  services: fullServices,
  stats: {
    glassSolutions: fullGlassSolutions.length,
    glassTypes: fullGlassTypes.length,
    models: fullModels.length,
    profileSuppliers: fullProfileSuppliers.length,
    services: fullServices.length,
    total:
      fullGlassTypes.length +
      fullProfileSuppliers.length +
      fullModels.length +
      fullServices.length +
      fullGlassSolutions.length,
  },
  useCases: [
    'Production database initialization',
    'Complete feature testing',
    'Full market analysis and reporting',
    'Maximum product variety for customer choice',
    'Comprehensive price comparison',
  ],
} as const;
