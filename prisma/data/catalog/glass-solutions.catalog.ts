/**
 * Glass Solutions Catalog - Colombian Market
 *
 * Based on international standards:
 * - EN 12600: Glass in building - Impact test
 * - ISO 717-1: Acoustics - Sound insulation
 * - ISO 10077: Thermal performance of windows/doors
 * - EN 356: Glass in building - Security glazing
 *
 * Solutions represent the primary purposes/benefits that glass types provide.
 * Each solution has performance ratings (basic, standard, good, very_good, excellent)
 * calculated based on glass characteristics.
 *
 * Data Source: Industry standards and Colombian market requirements
 * Last Updated: 2025-10-10
 */

/**
 * Glass Solution Record
 *
 * - key: English identifier for code (used in database)
 * - name: English name for internal use
 * - nameEs: Spanish name for UI display
 * - description: Spanish text for user-facing content
 * - icon: Lucide icon name for UI
 * - sortOrder: Display order in UI (lower = higher priority)
 */
export interface GlassSolutionRecord {
  description: string;
  icon: string;
  key: string;
  name: string;
  nameEs: string;
  sortOrder: number;
}

/**
 * Security Solution
 *
 * Provides protection against:
 * - Impact resistance (EN 12600)
 * - Break-in resistance (EN 356)
 * - Safety glass performance
 *
 * Key features: Tempered glass, laminated glass, thick glazing
 */
export const securitySolution: GlassSolutionRecord = {
  description: "Protección contra impactos, rotura y acceso no autorizado",
  icon: "Shield",
  key: "security",
  name: "Security",
  nameEs: "Seguridad",
  sortOrder: 1,
};

/**
 * Thermal Insulation Solution
 *
 * Reduces heat loss/gain through:
 * - Low-E coatings (low emissivity)
 * - Multiple glazing layers (DVH, triple glazing)
 * - Gas-filled chambers (argon, krypton)
 *
 * Performance measured by U-value (W/m²·K) per ISO 10077
 * - Single glazing: ~5.8 W/m²·K
 * - DVH with Low-E: ~1.6-2.0 W/m²·K
 * - Triple Low-E with argon: ~0.5-1.0 W/m²·K
 */
export const thermalInsulationSolution: GlassSolutionRecord = {
  description: "Reducción de pérdida de calor y mejora de eficiencia térmica",
  icon: "Snowflake",
  key: "thermal_insulation",
  name: "Thermal Insulation",
  nameEs: "Aislamiento Térmico",
  sortOrder: 2,
};

/**
 * Sound Insulation Solution
 *
 * Reduces exterior noise through:
 * - Laminated glass with PVB interlayer
 * - Asymmetric glazing (different glass thicknesses)
 * - Thicker glass panes
 *
 * Performance measured by Rw index (dB) per ISO 717-1
 * - Single 4mm: ~28 dB
 * - Laminated 6+6mm: ~35 dB
 * - DVH laminated: ~40-45 dB
 */
export const soundInsulationSolution: GlassSolutionRecord = {
  description: "Reducción de ruido exterior para mayor confort acústico",
  icon: "Volume2",
  key: "sound_insulation",
  name: "Sound Insulation",
  nameEs: "Insonorización",
  sortOrder: 3,
};

/**
 * Energy Efficiency Solution
 *
 * Optimizes energy consumption through:
 * - Solar control coatings
 * - Low-E technology
 * - Optimal glazing configuration
 *
 * Reduces HVAC costs and carbon footprint
 * Complements thermal insulation
 */
export const energyEfficiencySolution: GlassSolutionRecord = {
  description:
    "Ahorro energético mediante tecnología Low-E y doble/triple acristalamiento",
  icon: "Zap",
  key: "energy_efficiency",
  name: "Energy Efficiency",
  nameEs: "Eficiencia Energética",
  sortOrder: 4,
};

/**
 * Decorative Solution
 *
 * Aesthetic and privacy features:
 * - Frosted/satin glass
 * - Tinted glass
 * - Patterned glass
 * - Decorative laminates
 *
 * Primary focus: appearance and privacy, not performance
 */
export const decorativeSolution: GlassSolutionRecord = {
  description: "Estética, privacidad y elementos decorativos",
  icon: "Sparkles",
  key: "decorative",
  name: "Decorative",
  nameEs: "Decorativo",
  sortOrder: 5,
};

/**
 * General Purpose Solution
 *
 * Standard glass for everyday applications:
 * - Basic transparency
 * - No special performance requirements
 * - Cost-effective solution
 *
 * Fallback for glasses without specific purpose
 */
export const generalPurposeSolution: GlassSolutionRecord = {
  description: "Solución estándar para uso general",
  icon: "Home",
  key: "general",
  name: "General Purpose",
  nameEs: "Uso General",
  sortOrder: 6,
};

/**
 * Complete Glass Solutions Catalog
 *
 * All 6 solution categories in sortOrder
 */
export const glassSolutionsCatalog: readonly GlassSolutionRecord[] = [
  securitySolution,
  thermalInsulationSolution,
  soundInsulationSolution,
  energyEfficiencySolution,
  decorativeSolution,
  generalPurposeSolution,
] as const;

/**
 * Solutions by Category
 *
 * Grouped for easier filtering in UI
 */
export const glassSolutionsByCategory = {
  decorative: [decorativeSolution],
  efficiency: [energyEfficiencySolution],
  general: [generalPurposeSolution],
  insulation: [thermalInsulationSolution, soundInsulationSolution],
  security: [securitySolution],
} as const;

/**
 * High-Priority Solutions
 *
 * Most commonly requested solutions in Colombian market
 */
export const prioritySolutions: readonly GlassSolutionRecord[] = [
  securitySolution,
  thermalInsulationSolution,
  soundInsulationSolution,
] as const;
