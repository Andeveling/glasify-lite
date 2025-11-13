/**
 * Vitro Rojas - Glass Type Solutions Data
 *
 * Relaciones entre tipos de vidrio y soluciones.
 * Define qué vidrios son adecuados para qué soluciones con ratings de performance.
 *
 * Nota: glassTypeId y solutionId se resolverán dinámicamente después de insertar
 * glass types y solutions. Por ahora usamos keys de referencia.
 *
 * Performance Ratings (1-5):
 * - 5: Excellent - Máximo rendimiento para esta solución
 * - 4: Very Good - Muy buena opción, casi óptima
 * - 3: Good - Buena opción, cumple requisitos
 * - 2: Fair - Opción aceptable, no ideal
 * - 1: Poor - Rendimiento bajo, usar solo si no hay alternativa
 *
 * isPrimary: Indica si es la solución principal/preferida para ese vidrio
 *
 * Referencias usadas (se reemplazarán con IDs reales):
 * Glass Types: GUARD-CLR-6, GUARD-LOWE-6, SG-ACOUSTIC-8, etc.
 * Solutions: security, energy_efficiency, noise_reduction, etc.
 *
 * @version 1.0.0
 * @date 2025-11-13
 */

// Tipo temporal para construcción (se convertirá a NewGlassTypeSolution)
type GlassTypeSolutionRef = {
  glassTypeCode: string; // Código del vidrio (se buscará el ID)
  solutionKey: string; // Key de la solución (se buscará el ID)
  performanceRating: "excellent" | "very_good" | "good" | "fair" | "poor";
  isPrimary: boolean;
};

export const vitroRojasGlassTypeSolutionsRefs: GlassTypeSolutionRef[] = [
  // Guardian Clear 6mm
  {
    glassTypeCode: "GUARD-CLR-6",
    solutionKey: "aesthetic",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "GUARD-CLR-6",
    solutionKey: "natural_light",
    performanceRating: "excellent",
    isPrimary: false,
  },
  {
    glassTypeCode: "GUARD-CLR-6",
    solutionKey: "energy_efficiency",
    performanceRating: "poor",
    isPrimary: false,
  },

  // Guardian Clear 8mm
  {
    glassTypeCode: "GUARD-CLR-8",
    solutionKey: "aesthetic",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "GUARD-CLR-8",
    solutionKey: "natural_light",
    performanceRating: "excellent",
    isPrimary: false,
  },
  {
    glassTypeCode: "GUARD-CLR-8",
    solutionKey: "security",
    performanceRating: "fair",
    isPrimary: false,
  },

  // Guardian SunGuard Low-E 6mm
  {
    glassTypeCode: "GUARD-LOWE-6",
    solutionKey: "energy_efficiency",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "GUARD-LOWE-6",
    solutionKey: "solar_control",
    performanceRating: "excellent",
    isPrimary: false,
  },
  {
    glassTypeCode: "GUARD-LOWE-6",
    solutionKey: "uv_protection",
    performanceRating: "very_good",
    isPrimary: false,
  },
  {
    glassTypeCode: "GUARD-LOWE-6",
    solutionKey: "natural_light",
    performanceRating: "good",
    isPrimary: false,
  },

  // Saint-Gobain Stadip Silence 8mm (Acoustic)
  {
    glassTypeCode: "SG-ACOUSTIC-8",
    solutionKey: "noise_reduction",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "SG-ACOUSTIC-8",
    solutionKey: "security",
    performanceRating: "very_good",
    isPrimary: false,
  },
  {
    glassTypeCode: "SG-ACOUSTIC-8",
    solutionKey: "energy_efficiency",
    performanceRating: "good",
    isPrimary: false,
  },

  // Saint-Gobain Securit 10mm (Tempered)
  {
    glassTypeCode: "SG-TEMP-10",
    solutionKey: "security",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "SG-TEMP-10",
    solutionKey: "hurricane_impact",
    performanceRating: "very_good",
    isPrimary: false,
  },

  // AGC Sunergy 6mm (Solar Control)
  {
    glassTypeCode: "AGC-SUNERGY-6",
    solutionKey: "security",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "SG-TEMP-10",
    solutionKey: "hurricane_impact",
    performanceRating: "very_good",
    isPrimary: false,
  },

  // AGC Sunergy 6mm (Solar Control)
  {
    glassTypeCode: "AGC-SUNERGY-6",
    solutionKey: "solar_control",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "AGC-SUNERGY-6",
    solutionKey: "energy_efficiency",
    performanceRating: "excellent",
    isPrimary: false,
  },
  {
    glassTypeCode: "AGC-SUNERGY-6",
    solutionKey: "uv_protection",
    performanceRating: "very_good",
    isPrimary: false,
  },
  {
    glassTypeCode: "AGC-SUNERGY-6",
    solutionKey: "coastal_protection",
    performanceRating: "good",
    isPrimary: false,
  },

  // AGC Stopray Vision 50 - 6mm (Reflective)
  {
    glassTypeCode: "AGC-STOPRAY-6",
    solutionKey: "solar_control",
    performanceRating: "excellent",
    isPrimary: true,
  },
  {
    glassTypeCode: "AGC-STOPRAY-6",
    solutionKey: "privacy",
    performanceRating: "very_good",
    isPrimary: false,
  },
  {
    glassTypeCode: "AGC-STOPRAY-6",
    solutionKey: "energy_efficiency",
    performanceRating: "excellent",
    isPrimary: false,
  },

  // Vitro Claro 6mm (Económico)
  {
    glassTypeCode: "VITRO-CLR-6",
    solutionKey: "aesthetic",
    performanceRating: "good",
    isPrimary: true,
  },
  {
    glassTypeCode: "VITRO-CLR-6",
    solutionKey: "natural_light",
    performanceRating: "very_good",
    isPrimary: false,
  },

  // Vitro Tintado Gris 6mm
  {
    glassTypeCode: "VITRO-GREY-6",
    solutionKey: "solar_control",
    performanceRating: "good",
    isPrimary: true,
  },
  {
    glassTypeCode: "VITRO-GREY-6",
    solutionKey: "privacy",
    performanceRating: "good",
    isPrimary: false,
  },
  {
    glassTypeCode: "VITRO-GREY-6",
    solutionKey: "energy_efficiency",
    performanceRating: "fair",
    isPrimary: false,
  },

  // Cristalca Float Claro 4mm (Local básico)
  {
    glassTypeCode: "CRISTALCA-CLR-4",
    solutionKey: "aesthetic",
    performanceRating: "fair",
    isPrimary: true,
  },
  {
    glassTypeCode: "CRISTALCA-CLR-4",
    solutionKey: "natural_light",
    performanceRating: "good",
    isPrimary: false,
  },
];

/**
 * Nota para el preset:
 * Este archivo contiene referencias temporales (codes y keys).
 * El preset debe:
 * 1. Insertar glassTypes y obtener sus IDs
 * 2. Insertar glassSolutions y obtener sus IDs
 * 3. Resolver las referencias usando los códigos/keys
 * 4. Convertir performanceRating a enum DB
 * 5. Insertar glassTypeSolutions con IDs reales
 */
