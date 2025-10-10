/**
 * Glass Types Catalog - Colombian Market
 *
 * Real glass types available in the Colombian market with pricing and specifications.
 *
 * Data sources:
 * - docs/context/glassess.catalog.md
 * - https://www.aluviarte.com/tipos-de-vidrio-aluviarte.html
 * - https://vitrolit.com/productos/vidrio-templado-incoloro/
 * - https://vitrolit.com/productos/vidrio-laminado/
 * - https://vitelsa.com.co/insulado-dvh/
 * - https://www.vitroglazings.com/es/productos/vidrio-de-baja-emisividad-low-e/
 *
 * @version 1.0.0
 * @lastUpdated 2025-01-10
 */

import type { GlassTypeInput } from '../../factories/glass-type.factory';

/**
 * Common glass types available in Colombian market
 *
 * Categories:
 * - Monolítico (Float/Crudo): Basic glass, economical
 * - Templado: 5x stronger, safety glass
 * - Laminado: Security, retains fragments
 * - DVH (Doble Vidrio Hermético): Thermal/acoustic insulation
 * - Low-E: Energy efficient, reduces heat transfer
 * - Reflectivo/Control Solar: Reduces glare and solar gain
 */
export const glassTypesCatalog: GlassTypeInput[] = [
  // ==========================================
  // MONOLÍTICO (Float/Crudo) - Basic Glass
  // ==========================================
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Monolítico 4mm',
    pricePerSqm: 28_000, // COP
    purpose: 'general',
    thicknessMm: 4,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Monolítico 6mm',
    pricePerSqm: 35_000, // COP
    purpose: 'general',
    thicknessMm: 6,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Monolítico 8mm',
    pricePerSqm: 45_000, // COP
    purpose: 'general',
    thicknessMm: 8,
  },

  // ==========================================
  // TEMPLADO - Safety Glass (5x stronger)
  // ==========================================
  {
    isLaminated: false,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado 6mm',
    pricePerSqm: 65_000, // COP
    purpose: 'security',
    thicknessMm: 6,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado 8mm',
    pricePerSqm: 85_000, // COP
    purpose: 'security',
    thicknessMm: 8,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado 10mm',
    pricePerSqm: 105_000, // COP
    purpose: 'security',
    thicknessMm: 10,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado 12mm',
    pricePerSqm: 130_000, // COP
    purpose: 'security',
    thicknessMm: 12,
  },

  // ==========================================
  // LAMINADO - Security Glass (retains fragments)
  // ==========================================
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado 6mm (3+3)',
    pricePerSqm: 95_000, // COP
    purpose: 'security',
    thicknessMm: 6,
  },
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado 8mm (4+4)',
    pricePerSqm: 115_000, // COP
    purpose: 'security',
    thicknessMm: 8,
  },
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado 10mm (5+5)',
    pricePerSqm: 135_000, // COP
    purpose: 'security',
    thicknessMm: 10,
  },
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado Acústico 10mm',
    pricePerSqm: 155_000, // COP
    purpose: 'insulation',
    thicknessMm: 10,
  },

  // ==========================================
  // DVH (Doble Vidrio Hermético) - Insulated Glass
  // ==========================================
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH 20mm (4-12-4)',
    pricePerSqm: 120_000, // COP
    purpose: 'insulation',
    thicknessMm: 20,
    uValue: 2.8, // W/m²·K
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH 24mm (6-12-6)',
    pricePerSqm: 145_000, // COP
    purpose: 'insulation',
    thicknessMm: 24,
    uValue: 2.6, // W/m²·K
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH 28mm (6-16-6)',
    pricePerSqm: 165_000, // COP
    purpose: 'insulation',
    thicknessMm: 28,
    uValue: 2.4, // W/m²·K
  },

  // ==========================================
  // LOW-E (Baja Emisividad) - Energy Efficient
  // ==========================================
  {
    isLaminated: false,
    isLowE: true,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH Low-E 24mm (6-12-6)',
    pricePerSqm: 185_000, // COP
    purpose: 'insulation',
    thicknessMm: 24,
    uValue: 1.8, // W/m²·K (mejor aislamiento)
  },
  {
    isLaminated: false,
    isLowE: true,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH Low-E 28mm (6-16-6)',
    pricePerSqm: 210_000, // COP
    purpose: 'insulation',
    thicknessMm: 28,
    uValue: 1.6, // W/m²·K
  },

  // ==========================================
  // CONTROL SOLAR / REFLECTIVO
  // ==========================================
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Reflectivo 6mm',
    pricePerSqm: 75_000, // COP
    purpose: 'general',
    thicknessMm: 6,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH Control Solar 24mm (6-12-6)',
    pricePerSqm: 195_000, // COP
    purpose: 'insulation',
    thicknessMm: 24,
    uValue: 2.2, // W/m²·K
  },

  // ==========================================
  // ESPECIALIDADES
  // ==========================================
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Esmerilado 6mm',
    pricePerSqm: 55_000, // COP
    purpose: 'decorative',
    thicknessMm: 6,
  },
  {
    isLaminated: true,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado + Laminado 12mm (6+6)',
    pricePerSqm: 180_000, // COP
    purpose: 'security',
    thicknessMm: 12,
  },
];

/**
 * Glass types grouped by purpose for easy filtering
 */
export const glassTypesByPurpose = {
  decorative: glassTypesCatalog.filter((g) => g.purpose === 'decorative'),
  general: glassTypesCatalog.filter((g) => g.purpose === 'general'),
  insulation: glassTypesCatalog.filter((g) => g.purpose === 'insulation'),
  security: glassTypesCatalog.filter((g) => g.purpose === 'security'),
};

/**
 * Recommended glass types for different applications
 */
export const recommendedGlassTypes = {
  budget: [ 'Vidrio Monolítico 4mm', 'Vidrio Monolítico 6mm', 'Vidrio Templado 6mm' ],
  commercial: [ 'Vidrio Templado 10mm', 'DVH Low-E 28mm (6-16-6)', 'Vidrio Templado + Laminado 12mm (6+6)' ],
  premium: [ 'DVH Low-E 28mm (6-16-6)', 'Vidrio Templado + Laminado 12mm (6+6)', 'DVH Control Solar 24mm (6-12-6)' ],
  residential: [ 'Vidrio Templado 6mm', 'DVH 24mm (6-12-6)', 'Vidrio Laminado 6mm (3+3)' ],
};

/**
 * Glass types grouped by category
 */
export const glassTypesByCategory = {
  doubleGlazing: glassTypesCatalog.filter((g) => g.name.toLowerCase().includes('dvh')),
  laminated: glassTypesCatalog.filter((g) => g.name.toLowerCase().includes('laminado')),
  monolithic: glassTypesCatalog.filter((g) => g.name.toLowerCase().includes('monolítico')),
  specialty: glassTypesCatalog.filter(
    (g) =>
      g.name.toLowerCase().includes('low-e') ||
      g.name.toLowerCase().includes('control solar') ||
      g.name.toLowerCase().includes('reflectivo') ||
      g.name.toLowerCase().includes('acústico')
  ),
  tempered: glassTypesCatalog.filter(
    (g) => g.name.toLowerCase().includes('templado') && !g.name.toLowerCase().includes('laminado')
  ),
};
