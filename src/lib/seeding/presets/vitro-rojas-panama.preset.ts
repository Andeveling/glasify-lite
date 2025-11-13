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
import { vitroRojasGlassTypeSolutionsRefs } from "../data/vitro-rojas/glass-type-solutions.data";
import { vitroRojasGlassTypes } from "../data/vitro-rojas/glass-types.data";
import { vitroRojasModels } from "../data/vitro-rojas/models.data";
import { vitroRojasProfileSuppliers } from "../data/vitro-rojas/profile-suppliers.data";
import { vitroRojasServices } from "../data/vitro-rojas/services.data";
import { vitroRojasTenantConfig } from "../data/vitro-rojas/tenant-config.data";
import type { SeedPreset } from "../orchestrators/seed-orchestrator";

/**
 * Vitro Rojas Panama preset configuration
 *
 * Configuración completa incluyendo:
 * - Tenant configuration (business details, branding)
 * - Glass characteristics (16 items)
 * - Glass solutions (10 solutions)
 * - Profile suppliers (6 suppliers)
 * - Glass suppliers (6 suppliers)
 * - Glass types (10 products with specs)
 * - Models (10 window/door models)
 * - Services (14 services)
 * - Glass type solutions (relationships with performance ratings)
 */
export const vitroRojasPanamaPreset: SeedPreset = {
  name: "vitro-rojas-panama",
  description:
    "Configuración de producción completa para cliente Vitro Rojas Panamá",

  tenantConfigs: [vitroRojasTenantConfig],
  glassCharacteristics: vitroRojasGlassCharacteristics,
  glassSolutions: vitroRojasGlassSolutions,
  profileSuppliers: vitroRojasProfileSuppliers,
  glassSuppliers: vitroRojasGlassSuppliers,
  glassTypes: vitroRojasGlassTypes,
  models: vitroRojasModels,
  services: vitroRojasServices,

  // Glass type solutions requieren resolución de IDs
  // El orchestrator deberá:
  // 1. Insertar glassTypes y glassSolutions
  // 2. Obtener sus IDs
  // 3. Resolver referencias de vitroRojasGlassTypeSolutionsRefs
  // 4. Insertar glassTypeSolutions con IDs reales
  glassTypeSolutions: [], // Se poblará dinámicamente por el orchestrator

  // Metadata para resolución de referencias
  _refs: {
    glassTypeSolutions: vitroRojasGlassTypeSolutionsRefs,
  },
};
