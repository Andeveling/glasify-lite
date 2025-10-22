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
    code: 'MONO4',
    name: 'Vidrio Monolítico 4mm',
    thicknessMm: 4,
  },
  {
    code: 'MONO6',
    name: 'Vidrio Monolítico 6mm',
    thicknessMm: 6,
  },
  {
    code: 'MONO8',
    name: 'Vidrio Monolítico 8mm',
    thicknessMm: 8,
  },

  // ==========================================
  // TEMPLADO - Safety Glass (5x stronger)
  // ==========================================
  {
    code: 'TEMP6',
    name: 'Vidrio Templado 6mm',
    thicknessMm: 6,
  },
  {
    code: 'TEMP8',
    name: 'Vidrio Templado 8mm',
    thicknessMm: 8,
  },
  {
    code: 'TEMP10',
    name: 'Vidrio Templado 10mm',
    thicknessMm: 10,
  },
  {
    code: 'TEMP12',
    name: 'Vidrio Templado 12mm',
    thicknessMm: 12,
  },

  // ==========================================
  // LAMINADO - Security Glass (retains fragments)
  // ==========================================
  {
    code: 'LAM6',
    name: 'Vidrio Laminado 6mm (3+3)',
    thicknessMm: 6,
  },
  {
    code: 'LAM8',
    name: 'Vidrio Laminado 8mm (4+4)',
    thicknessMm: 8,
  },
  {
    code: 'LAM10',
    name: 'Vidrio Laminado 10mm (5+5)',
    thicknessMm: 10,
  },
  {
    code: 'LAM10',
    name: 'Vidrio Laminado Acústico 10mm',
    thicknessMm: 10,
  },

  // ==========================================
  // DVH (Doble Vidrio Hermético) - Insulated Glass
  // ==========================================
  {
    code: 'DVH20',
    name: 'DVH 20mm (4-12-4)',
    thicknessMm: 20,
    uValue: 2.8, // W/m²·K
  },
  {
    code: 'DVH24',
    name: 'DVH 24mm (6-12-6)',
    thicknessMm: 24,
    uValue: 2.6, // W/m²·K
  },
  {
    code: 'DVH28',
    name: 'DVH 28mm (6-16-6)',
    thicknessMm: 28,
    uValue: 2.4, // W/m²·K
  },

  // ==========================================
  // LOW-E (Baja Emisividad) - Energy Efficient
  // ==========================================
  {
    code: 'DVH24',
    name: 'DVH Low-E 24mm (6-12-6)',
    thicknessMm: 24,
    uValue: 1.8, // W/m²·K (mejor aislamiento)
  },
  {
    code: 'DVH28',
    name: 'DVH Low-E 28mm (6-16-6)',
    thicknessMm: 28,
    uValue: 1.6, // W/m²·K
  },

  // ==========================================
  // CONTROL SOLAR / REFLECTIVO
  // ==========================================
  {
    code: 'REFL6',
    name: 'Vidrio Reflectivo 6mm',
    thicknessMm: 6,
  },
  {
    code: 'DVH24',
    name: 'DVH Control Solar 24mm (6-12-6)',
    thicknessMm: 24,
    uValue: 2.2, // W/m²·K
  },

  // ==========================================
  // ESPECIALIDADES
  // ==========================================
  {
    code: 'GLASS6',
    name: 'Vidrio Esmerilado 6mm',
    thicknessMm: 6,
  },
  {
    code: 'TEMP12',
    name: 'Vidrio Templado + Laminado 12mm (6+6)',
    thicknessMm: 12,
  },
];

/**
 * DEPRECATED: Glass types grouped by purpose
 * Purpose field was removed in v2.0
 * Use characteristics relationships instead for filtering
 */
// export const glassTypesByPurpose = {
//   decorative: glassTypesCatalog.filter((g) => g.purpose === 'decorative'),
//   general: glassTypesCatalog.filter((g) => g.purpose === 'general'),
//   insulation: glassTypesCatalog.filter((g) => g.purpose === 'insulation'),
//   security: glassTypesCatalog.filter((g) => g.purpose === 'security'),
// };

/**
 * Recommended glass types for different applications
 */
export const recommendedGlassTypes = {
  budget: ['Vidrio Monolítico 4mm', 'Vidrio Monolítico 6mm', 'Vidrio Templado 6mm'],
  commercial: ['Vidrio Templado 10mm', 'DVH Low-E 28mm (6-16-6)', 'Vidrio Templado + Laminado 12mm (6+6)'],
  premium: ['DVH Low-E 28mm (6-16-6)', 'Vidrio Templado + Laminado 12mm (6+6)', 'DVH Control Solar 24mm (6-12-6)'],
  residential: ['Vidrio Templado 6mm', 'DVH 24mm (6-12-6)', 'Vidrio Laminado 6mm (3+3)'],
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
