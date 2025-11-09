/**
 * Minimal Preset - Drizzle Seeding
 *
 * Basic test configuration with minimal data for development and testing.
 *
 * @version 2.0.0 - Drizzle Migration
 * @date 2025-11-09
 */

import type { SeedPreset } from "../orchestrators/seed-orchestrator";

/**
 * Minimal glass suppliers for testing
 */
const minimalGlassSuppliers: SeedPreset["glassSuppliers"] = [
  {
    name: "Vidriera Local",
    code: "VL-001",
    country: "Panamá",
    isActive: true,
    notes: "Proveedor local de prueba para desarrollo",
  },
  {
    name: "Guardian Glass",
    code: "GG-001",
    country: "Estados Unidos",
    website: "https://www.guardianglass.com",
    contactEmail: "info@guardianglass.com",
    contactPhone: "+1 (248) 340-1800",
    isActive: true,
    notes: "Fabricante internacional líder en vidrio arquitectónico",
  },
];

/**
 * Minimal profile suppliers for testing
 */
const minimalProfileSuppliers: SeedPreset["profileSuppliers"] = [
  {
    name: "Aluminios del Pacífico",
    materialType: "ALUMINUM",
    isActive: true,
    notes: "Proveedor local de perfiles de aluminio",
  },
  {
    name: "PVC Profiles International",
    materialType: "PVC",
    isActive: true,
    notes: "Proveedor internacional de perfiles PVC",
  },
];

/**
 * Minimal preset configuration
 */
export const minimalPreset: SeedPreset = {
  name: "minimal",
  description: "Minimal test configuration with basic data",
  profileSuppliers: minimalProfileSuppliers,
  glassSuppliers: minimalGlassSuppliers,
};
