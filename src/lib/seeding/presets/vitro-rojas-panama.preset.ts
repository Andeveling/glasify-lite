/**
 * Vitro Rojas Panama Preset - Drizzle Seeding
 *
 * Production configuration for Vitro Rojas Panama client.
 * Includes real suppliers and production-ready data.
 *
 * @version 3.0.0 - Complete Dataset
 * @date 2025-11-13
 */

import { vitroRojasGlassCharacteristics } from "../data/vitro-rojas/glass-characteristics.data";
import { vitroRojasGlassSolutions } from "../data/vitro-rojas/glass-solutions.data";
import { vitroRojasGlassSuppliers } from "../data/vitro-rojas/glass-suppliers.data";
import { vitroRojasGlassTypes } from "../data/vitro-rojas/glass-types.data";
import { vitroRojasModels } from "../data/vitro-rojas/models.data";
import { vitroRojasProfileSuppliers } from "../data/vitro-rojas/profile-suppliers.data";
import { vitroRojasServices } from "../data/vitro-rojas/services.data";
import type { SeedPreset } from "../orchestrators/seed-orchestrator";

/**
 * Vitro Rojas Panama preset configuration
 *
 * Configuración completa incluyendo:
 * - Glass characteristics (16 items)
 * - Glass solutions (10 solutions)
 * - Profile suppliers (6 suppliers)
 * - Glass suppliers (6 suppliers)
 * - Glass types (10 products with specs)
 * - Models (10 window/door models)
 * - Services (14 services)
 * - Glass type solutions (relationships - to be resolved dynamically)
 *
 * NOTA: Tenant config se maneja separadamente, no forma parte del SeedPreset type.
 * NOTA: glassTypeSolutions requiere resolución de IDs (ver vitroRojasGlassTypeSolutionsRefs).
 */
export const vitroRojasPanamaPreset: SeedPreset = {
  name: "vitro-rojas-panama",
  description:
    "Configuración de producción completa para cliente Vitro Rojas Panamá",

  glassCharacteristics: vitroRojasGlassCharacteristics,
  glassSolutions: vitroRojasGlassSolutions,
  profileSuppliers: vitroRojasProfileSuppliers,
  glassSuppliers: vitroRojasGlassSuppliers,
  glassTypes: vitroRojasGlassTypes,
  models: vitroRojasModels,
  services: vitroRojasServices,

  // Glass type solutions requieren resolución de IDs
  // Se debe implementar lógica en orchestrator o seeder para:
  // 1. Insertar glassTypes y glassSolutions
  // 2. Obtener sus IDs
  // 3. Mapear vitroRojasGlassTypeSolutionsRefs usando códigos
  // 4. Insertar glassTypeSolutions con IDs reales
  glassTypeSolutions: [], // Empty for now, requires FK resolution
};

/**
 * Reference data for glass type solutions (requires ID resolution)
 *
 * Use this data after inserting glassTypes and glassSolutions:
 * 1. Insert vitroRojasGlassTypes → get IDs mapped by code
 * 2. Insert vitroRojasGlassSolutions → get IDs mapped by key
 * 3. Transform vitroRojasGlassTypeSolutionsRefs using ID maps
 * 4. Insert transformed data as glassTypeSolutions
 */
export { vitroRojasGlassTypeSolutionsRefs } from "../data/vitro-rojas/glass-type-solutions.data";

/**
 * Tenant configuration for Vitro Rojas
 *
 * This should be seeded separately using tenant config seeder,
 * not as part of the catalog preset.
 */
export { vitroRojasTenantConfig } from "../data/vitro-rojas/tenant-config.data";
