/**
 * Minimal Preset - Basic Seed Configuration
 *
 * Use case: Quick testing, CI/CD pipelines, minimal viable product
 *
 * Contains:
 * - 3 essential glass types (simple, tempered, DVH)
 * - 2 active profile suppliers (PVC and Aluminum)
 * - 2 basic window models (sliding and casement)
 * - 3 core services (installation, sealing, removal)
 * - 3 glass solutions (security, thermal, general)
 *
 * @version 1.0.0
 */

import type { GlassSolutionInput } from "../../factories/glass-solution.factory";
import type { GlassTypeInput } from "../../factories/glass-type.factory";
import type { ModelInput } from "../../factories/model.factory";
import type { ProfileSupplierInput } from "../../factories/profile-supplier.factory";
import type { ServiceInput } from "../../factories/service.factory";

// ==========================================
// GLASS TYPES (3 essential)
// ==========================================

/**
 * Essential glass types for minimal setup
 */
export const minimalGlassTypes: GlassTypeInput[] = [
  {
    code: "MIN_SIMPLE4",
    name: "Vidrio Simple 4mm",
    thicknessMm: 4,
  },
  {
    code: "MIN_TEMP6",
    name: "Vidrio Templado 6mm",
    thicknessMm: 6,
  },
  {
    code: "MIN_DVH24",
    name: "DVH 24mm (6-12-6)",
    thicknessMm: 24,
    uValue: 2.8,
  },
];

// ==========================================
// PROFILE SUPPLIERS (2 active)
// ==========================================

/**
 * Essential profile suppliers
 */
export const minimalProfileSuppliers: ProfileSupplierInput[] = [
  {
    isActive: true,
    materialType: "PVC",
    name: "Deceuninck",
    notes: "Premium PVC profiles - European quality",
  },
  {
    isActive: true,
    materialType: "ALUMINUM",
    name: "Alumina",
    notes: "Colombian aluminum manufacturer - local production",
  },
];

// ==========================================
// MODELS (2 basic)
// ==========================================

/**
 * Essential window models
 */
export const minimalModels: ModelInput[] = [
  {
    accessoryPrice: 65_000,
    basePrice: 350_000,
    compatibleGlassTypeIds: ["PLACEHOLDER"], // Will be populated during seeding
    costPerMmHeight: 75,
    costPerMmWidth: 95,
    glassDiscountHeightMm: 45,
    glassDiscountWidthMm: 45,
    maxHeightMm: 2200,
    maxWidthMm: 2500,
    minHeightMm: 500,
    minWidthMm: 700,
    name: "Ventana Corredera Estándar",
    profileSupplierName: "Deceuninck",
    profitMarginPercentage: 30,
    status: "published",
  },
  {
    accessoryPrice: 55_000,
    basePrice: 280_000,
    compatibleGlassTypeIds: ["PLACEHOLDER"],
    costPerMmHeight: 65,
    costPerMmWidth: 85,
    glassDiscountHeightMm: 35,
    glassDiscountWidthMm: 35,
    maxHeightMm: 1800,
    maxWidthMm: 2400,
    minHeightMm: 400,
    minWidthMm: 600,
    name: "Ventana Corredera Aluminio",
    profileSupplierName: "Alumina",
    profitMarginPercentage: 28,
    status: "published",
  },
];

// ==========================================
// SERVICES (3 core)
// ==========================================

/**
 * Essential services
 */
export const minimalServices: ServiceInput[] = [
  {
    name: "Instalación Estándar",
    rate: 45_000,
    type: "area",
    unit: "sqm",
  },
  {
    name: "Sellado Perimetral",
    rate: 8500,
    type: "perimeter",
    unit: "ml",
  },
  {
    name: "Retiro de Ventana Antigua",
    rate: 55_000,
    type: "fixed",
    unit: "unit",
  },
];

// ==========================================
// GLASS SOLUTIONS (3 essential)
// ==========================================

/**
 * Essential glass solutions
 */
export const minimalGlassSolutions: GlassSolutionInput[] = [
  {
    description: "Protección contra impactos, rotura y acceso no autorizado",
    icon: "Shield",
    key: "security",
    name: "Security",
    nameEs: "Seguridad",
    sortOrder: 1,
  },
  {
    description: "Reducción de pérdida de calor y mejora de eficiencia térmica",
    icon: "Snowflake",
    key: "thermal_insulation",
    name: "Thermal Insulation",
    nameEs: "Aislamiento Térmico",
    sortOrder: 2,
  },
  {
    description: "Solución estándar para uso general",
    icon: "Home",
    key: "general",
    name: "General Purpose",
    nameEs: "Uso General",
    sortOrder: 6,
  },
];

// ==========================================
// PRESET EXPORT
// ==========================================

/**
 * Minimal preset configuration
 */
export const minimalPreset = {
  description: "Configuración mínima para pruebas rápidas y CI/CD",
  glassSolutions: minimalGlassSolutions,
  glassTypes: minimalGlassTypes,
  models: minimalModels,
  name: "minimal",
  profileSuppliers: minimalProfileSuppliers,
  services: minimalServices,
  stats: {
    glassSolutions: minimalGlassSolutions.length,
    glassTypes: minimalGlassTypes.length,
    models: minimalModels.length,
    profileSuppliers: minimalProfileSuppliers.length,
    services: minimalServices.length,
    total:
      minimalGlassTypes.length +
      minimalProfileSuppliers.length +
      minimalModels.length +
      minimalServices.length +
      minimalGlassSolutions.length,
  },
} as const;
