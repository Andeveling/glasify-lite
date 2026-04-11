/**
 * Vitro Rojas - Glass Type to Solution Mappings
 *
 * Define relationships between glass types and solutions with performance ratings.
 * Used by seeder to create GlassTypeSolution junction table records.
 *
 * Data source: Vitro Rojas S.A. - Lista de precios oficial (Abril 2026)
 *
 * @version 2.0.0
 * @date 2026-04-04
 */

/**
 * Performance rating enum (matches Prisma schema)
 */
export type PerformanceRating =
  | "basic"
  | "standard"
  | "good"
  | "very_good"
  | "excellent";

/**
 * Mapping input structure
 */
export type GlassTypeSolutionMapping = {
  glassTypeCode: string;
  isPrimary: boolean;
  performanceRating: PerformanceRating;
  solutionKey: string;
};

/**
 * Glass type to solution relationship mappings
 *
 * Structure:
 * - glassTypeCode: Code from glass-types.data.ts (e.g., "VR_CLEAR6")
 * - solutionKey: Key from glass-solutions.data.ts (e.g., "general")
 * - isPrimary: If this solution is the primary use case for this glass
 * - performanceRating: How well this glass performs for this solution
 *
 * Vitro Rojas April 2026 pricing:
 * - Vidrio Claro 6mm: $12 → general
 * - Vidrio Gris 6mm: $14 → decorative
 * - Vidrio Bronce 6mm: $14 → decorative
 * - Vidrio Laminado Claro 6mm: $16 → security
 * - Vidrio Laminado Gris 6mm: $18 → security + decorative
 * - Vidrio Laminado Bronce 6mm: $18 → security + decorative
 * - Vidrio Reflectivo 6mm: $20 → decorative
 * - Vidrio Insulado (DVH): $40 → energy_efficiency
 */
export const vitroRojasGlassTypeSolutionMappings: GlassTypeSolutionMapping[] = [
  // ==========================================
  // USO GENERAL (🏠 General Purpose)
  // ==========================================
  {
    glassTypeCode: "VR_CLEAR6",
    isPrimary: true,
    performanceRating: "standard",
    solutionKey: "general",
  },

  // ==========================================
  // SEGURIDAD (🛡️ Security)
  // ==========================================
  {
    glassTypeCode: "VR_LAM_CLEAR6",
    isPrimary: true,
    performanceRating: "good",
    solutionKey: "security",
  },
  {
    glassTypeCode: "VR_LAM_GRAY6",
    isPrimary: true,
    performanceRating: "very_good",
    solutionKey: "security",
  },
  {
    glassTypeCode: "VR_LAM_BRONZE6",
    isPrimary: true,
    performanceRating: "very_good",
    solutionKey: "security",
  },

  // ==========================================
  // AISLAMIENTO TÉRMICO (❄️ Thermal Insulation)
  // ==========================================
  {
    glassTypeCode: "VR_INSUL21",
    isPrimary: true,
    performanceRating: "excellent",
    solutionKey: "energy_efficiency",
  },

  // ==========================================
  // DECORATIVO (✨ Decorative)
  // ==========================================
  {
    glassTypeCode: "VR_GRAY6",
    isPrimary: true,
    performanceRating: "good",
    solutionKey: "decorative",
  },
  {
    glassTypeCode: "VR_BRONZE6",
    isPrimary: true,
    performanceRating: "good",
    solutionKey: "decorative",
  },
  {
    glassTypeCode: "VR_REFL6",
    isPrimary: true,
    performanceRating: "very_good",
    solutionKey: "decorative",
  },

  // ==========================================
  // SECONDARY ASSIGNMENTS (Cross-category benefits)
  // ==========================================

  // Laminados también ofrecen beneficio decorativo (privacidad)
  {
    glassTypeCode: "VR_LAM_GRAY6",
    isPrimary: false,
    performanceRating: "good",
    solutionKey: "decorative",
  },
  {
    glassTypeCode: "VR_LAM_BRONZE6",
    isPrimary: false,
    performanceRating: "good",
    solutionKey: "decorative",
  },

  // DVH también ofrece beneficio de seguridad (doble capa)
  {
    glassTypeCode: "VR_INSUL21",
    isPrimary: false,
    performanceRating: "good",
    solutionKey: "security",
  },
];
