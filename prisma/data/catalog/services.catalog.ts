/**
 * Services Catalog - Colombian Market
 *
 * Installation, finishing, and additional services for windows and doors.
 * Pricing based on Colombian market rates (2025).
 *
 * Type mapping:
 * - 'area': Services charged per square meter (sqm) - installations, coatings
 * - 'perimeter': Services charged per linear meter (ml) - sealing, trim work
 * - 'fixed': Services charged per unit - mosquito screens, hardware, removal
 *
 * @version 1.0.0
 * @lastUpdated 2025-01-10
 */

import type { ServiceInput } from '../../factories/service.factory';

// ==========================================
// INSTALLATION SERVICES
// ==========================================

/**
 * Standard window/door installation
 * Instalación profesional: nivelación, fijación con anclajes, ajuste herrajes
 */
export const standardInstallation: ServiceInput = {
  name: 'Instalación Estándar de Ventana/Puerta',
  rate: 45_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

/**
 * Premium installation with waterproofing
 * Instalación premium: membrana hidrófuga, sellado profesional, anclajes reforzados
 */
export const premiumInstallation: ServiceInput = {
  name: 'Instalación Premium con Impermeabilización',
  rate: 75_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

/**
 * Installation for high-rise buildings
 * Instalación en altura: andamio/plataforma, personal certificado, seguro
 */
export const highRiseInstallation: ServiceInput = {
  name: 'Instalación en Altura (Andamio/Plataforma)',
  rate: 95_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

// ==========================================
// SEALING & WATERPROOFING
// ==========================================

/**
 * Perimeter sealing with silicone
 * Silicona estructural perimetral para hermeticidad
 */
export const perimeterSealing: ServiceInput = {
  name: 'Sellado Perimetral con Silicona Estructural',
  rate: 8500, // COP por metro lineal
  type: 'perimeter',
  unit: 'ml',
};

/**
 * Advanced waterproofing system
 * Sistema impermeabilización con membrana líquida
 */
export const advancedWaterproofing: ServiceInput = {
  name: 'Sistema de Impermeabilización Avanzada',
  rate: 35_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

// ==========================================
// SURFACE TREATMENT & FINISHING
// ==========================================

/**
 * Aluminum anodizing finish
 * Anodizado de aluminio: natural, bronce, negro
 */
export const aluminumAnodizing: ServiceInput = {
  name: 'Anodizado de Perfiles de Aluminio',
  rate: 28_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

/**
 * Electrostatic powder coating
 * Pintura electrostática con colores RAL
 */
export const powderCoating: ServiceInput = {
  name: 'Pintura Electrostática (Powder Coating)',
  rate: 32_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

/**
 * Wood varnishing/staining
 * Barniz/tinte para madera con lijado y sellador
 */
export const woodVarnishing: ServiceInput = {
  name: 'Barnizado/Tinte para Perfiles de Madera',
  rate: 42_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

// ==========================================
// GLASS TREATMENTS
// ==========================================

/**
 * Safety film installation
 * Película transparente anti-impacto 4-8 mil
 */
export const safetyFilm: ServiceInput = {
  name: 'Película de Seguridad Anti-Impacto',
  rate: 55_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

/**
 * UV protection film
 * Película reflectiva control solar, bloquea 99% UV
 */
export const uvProtectionFilm: ServiceInput = {
  name: 'Película de Control Solar/UV',
  rate: 48_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

/**
 * Privacy film (frosted/decorative)
 * Película translúcida para privacidad
 */
export const privacyFilm: ServiceInput = {
  name: 'Película de Privacidad (Esmerilado/Decorativo)',
  rate: 38_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

// ==========================================
// HARDWARE & ACCESSORIES
// ==========================================

/**
 * Mosquito screen installation
 * Mosquitero corredero/enrollable en marco aluminio
 */
export const mosquitoScreen: ServiceInput = {
  name: 'Mosquitero en Fibra de Vidrio',
  rate: 85_000, // COP por unidad
  type: 'fixed',
  unit: 'unit',
};

/**
 * Security bars (grilles)
 * Reja metálica de seguridad con acabado anticorrosivo
 */
export const securityBars: ServiceInput = {
  name: 'Reja de Seguridad Exterior',
  rate: 180_000, // COP por unidad
  type: 'fixed',
  unit: 'unit',
};

/**
 * Motorized operation system
 * Motor eléctrico con control remoto y sensor obstáculos
 */
export const motorizedSystem: ServiceInput = {
  name: 'Sistema de Motorización Automática',
  rate: 650_000, // COP por unidad
  type: 'fixed',
  unit: 'unit',
};

// ==========================================
// DEMOLITION & REMOVAL
// ==========================================

/**
 * Old window/door removal
 * Desmonte y retiro con protección de áreas
 */
export const oldWindowRemoval: ServiceInput = {
  name: 'Retiro de Ventana/Puerta Antigua',
  rate: 55_000, // COP por unidad
  type: 'fixed',
  unit: 'unit',
};

/**
 * Wall opening/resizing
 * Modificación de vano con demolición controlada y refuerzo
 */
export const wallOpeningResize: ServiceInput = {
  name: 'Ampliación/Reducción de Vano',
  rate: 120_000, // COP por metro lineal
  type: 'perimeter',
  unit: 'ml',
};

// ==========================================
// MAINTENANCE & REPAIR
// ==========================================

/**
 * Hardware adjustment/repair
 * Ajuste de bisagras, cierres, lubricación
 */
export const hardwareAdjustment: ServiceInput = {
  name: 'Ajuste y Mantenimiento de Herrajes',
  rate: 35_000, // COP por unidad
  type: 'fixed',
  unit: 'unit',
};

/**
 * Glass replacement
 * Reemplazo de vidrio: retiro, limpieza, instalación, sellado
 */
export const glassReplacement: ServiceInput = {
  name: 'Reemplazo de Vidrio (Labor)',
  rate: 42_000, // COP por m²
  type: 'area',
  unit: 'sqm',
};

/**
 * Seal replacement
 * Reemplazo de sellos EPDM perimetrales
 */
export const sealReplacement: ServiceInput = {
  name: 'Reemplazo de Sellos de Goma (EPDM)',
  rate: 6500, // COP por metro lineal
  type: 'perimeter',
  unit: 'ml',
};

// ==========================================
// CATALOG EXPORT
// ==========================================

/**
 * All services catalog
 */
export const servicesCatalog: ServiceInput[] = [
  // Installation
  standardInstallation,
  premiumInstallation,
  highRiseInstallation,

  // Sealing & Waterproofing
  perimeterSealing,
  advancedWaterproofing,

  // Surface Treatment
  aluminumAnodizing,
  powderCoating,
  woodVarnishing,

  // Glass Treatments
  safetyFilm,
  uvProtectionFilm,
  privacyFilm,

  // Hardware & Accessories
  mosquitoScreen,
  securityBars,
  motorizedSystem,

  // Demolition & Removal
  oldWindowRemoval,
  wallOpeningResize,

  // Maintenance & Repair
  hardwareAdjustment,
  glassReplacement,
  sealReplacement,
];

/**
 * Services grouped by category
 */
export const servicesByCategory = {
  accessories: [ mosquitoScreen, securityBars, motorizedSystem ],
  demolition: [ oldWindowRemoval, wallOpeningResize ],
  finishing: [ aluminumAnodizing, powderCoating, woodVarnishing ],
  glassTreatment: [ safetyFilm, uvProtectionFilm, privacyFilm ],
  installation: [ standardInstallation, premiumInstallation, highRiseInstallation ],
  maintenance: [ hardwareAdjustment, glassReplacement, sealReplacement ],
  sealing: [ perimeterSealing, advancedWaterproofing ],
};

/**
 * Recommended service bundles for common scenarios
 */
export const serviceBundles = {
  aluminumFinishing: [ 'Anodizado de Perfiles de Aluminio', 'Película de Control Solar/UV' ],
  maintenance: [ 'Ajuste y Mantenimiento de Herrajes', 'Reemplazo de Sellos de Goma (EPDM)' ],
  newInstallationBasic: [ 'Instalación Estándar de Ventana/Puerta', 'Sellado Perimetral con Silicona Estructural' ],
  newInstallationPremium: [
    'Instalación Premium con Impermeabilización',
    'Sellado Perimetral con Silicona Estructural',
    'Mosquitero en Fibra de Vidrio',
  ],
  replacement: [
    'Retiro de Ventana/Puerta Antigua',
    'Instalación Estándar de Ventana/Puerta',
    'Sellado Perimetral con Silicona Estructural',
  ],
  securityUpgrade: [ 'Película de Seguridad Anti-Impacto', 'Reja de Seguridad Exterior' ],
};
