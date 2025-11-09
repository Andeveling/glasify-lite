/**
 * Vitro Rojas - Glass Type to Solution Mappings
 *
 * Define relationships between glass types and solutions with performance ratings.
 * Used by seeder to create GlassTypeSolution junction table records.
 *
 * Performance ratings based on international standards:
 * - EN 12600: Glass in building - Impact test
 * - ISO 717-1: Acoustics - Sound insulation
 * - ISO 10077: Thermal performance of windows/doors
 * - EN 356: Glass in building - Security glazing
 *
 * @version 1.0.0
 * @date 2025-01-28
 */

/**
 * Performance rating enum (matches Prisma schema)
 */
export type PerformanceRating = "LOW" | "MEDIUM" | "HIGH" | "EXCELLENT";

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
 * Distribution across tabs:
 * - 🏠 Uso General: 2 types (VR_CLEAR6, VR_CLEAR8)
 * - 🛡️ Seguridad: 3 types (VR_LAM6, VR_LAM8, VR_TEMP6)
 * - ❄️ Aislamiento Térmico: 2 types (VR_DVH16, VR_DVH18)
 * - ✨ Decorativo: 4 types (VR_GRAY6, VR_BRONZE6, VR_REFL6, VR_LAMGRAY6)
 */
export const vitroRojasGlassTypeSolutionMappings: GlassTypeSolutionMapping[] = [
  // ==========================================
  // USO GENERAL (🏠 General Purpose)
  // ==========================================
  {
    glassTypeCode: "VR_CLEAR6",
    isPrimary: true,
    performanceRating: "MEDIUM",
    solutionKey: "general",
  },
  {
    glassTypeCode: "VR_CLEAR8",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "general",
  },

  // ==========================================
  // SEGURIDAD (🛡️ Security)
  // ==========================================
  {
    glassTypeCode: "VR_LAM6",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "security",
  },
  {
    glassTypeCode: "VR_LAM8",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "security",
  },
  {
    glassTypeCode: "VR_TEMP6",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "security",
  },

  // ==========================================
  // AISLAMIENTO TÉRMICO (❄️ Thermal Insulation)
  // ==========================================
  {
    glassTypeCode: "VR_DVH16",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "energy_efficiency",
  },
  {
    glassTypeCode: "VR_DVH18",
    isPrimary: true,
    performanceRating: "EXCELLENT",
    solutionKey: "energy_efficiency",
  },

  // ==========================================
  // DECORATIVO (✨ Decorative)
  // ==========================================
  {
    glassTypeCode: "VR_GRAY6",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "decorative",
  },
  {
    glassTypeCode: "VR_BRONZE6",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "decorative",
  },
  {
    glassTypeCode: "VR_REFL6",
    isPrimary: true,
    performanceRating: "HIGH",
    solutionKey: "decorative",
  },
  {
    glassTypeCode: "VR_LAMGRAY6",
    isPrimary: true,
    performanceRating: "EXCELLENT",
    solutionKey: "decorative",
  },

  // ==========================================
  // SECONDARY ASSIGNMENTS (Cross-category benefits)
  // ==========================================

  // Laminados también ofrecen beneficio decorativo (privacidad)
  {
    glassTypeCode: "VR_LAM6",
    isPrimary: false,
    performanceRating: "MEDIUM",
    solutionKey: "decorative",
  },
  {
    glassTypeCode: "VR_LAM8",
    isPrimary: false,
    performanceRating: "MEDIUM",
    solutionKey: "decorative",
  },

  // DVH también ofrece beneficio de seguridad (doble capa)
  {
    glassTypeCode: "VR_DVH16",
    isPrimary: false,
    performanceRating: "MEDIUM",
    solutionKey: "security",
  },
  {
    glassTypeCode: "VR_DVH18",
    isPrimary: false,
    performanceRating: "HIGH",
    solutionKey: "security",
  },

  // Laminado gris combina seguridad + decorativo
  {
    glassTypeCode: "VR_LAMGRAY6",
    isPrimary: false,
    performanceRating: "HIGH",
    solutionKey: "security",
  },
];
