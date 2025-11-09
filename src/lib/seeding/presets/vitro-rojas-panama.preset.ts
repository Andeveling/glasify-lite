/**
 * Vitro Rojas Panama Preset - Drizzle Seeding
 *
 * Production configuration for Vitro Rojas Panama client.
 * Includes real suppliers and production-ready data.
 *
 * @version 2.0.0 - Drizzle Migration
 * @date 2025-11-09
 */

import type { SeedPreset } from "../orchestrators/seed-orchestrator";

/**
 * Vitro Rojas glass suppliers (production data)
 */
const vitroRojasGlassSuppliers: SeedPreset["glassSuppliers"] = [
  {
    name: "Vidriera Nacional S.A.",
    code: "VN-PA",
    country: "Panamá",
    website: "https://www.vidrieranacional.com",
    contactEmail: "ventas@vidrieranacional.com",
    contactPhone: "+507 236-5555",
    isActive: true,
    notes:
      "Principal proveedor local de vidrio en Panamá. Representante autorizado de marcas internacionales.",
  },
  {
    name: "Guardian Glass Panamá",
    code: "GG-PA",
    country: "Panamá",
    website: "https://www.guardianglass.com/pa",
    contactEmail: "panama@guardianglass.com",
    contactPhone: "+507 305-7000",
    isActive: true,
    notes:
      "Distribuidor autorizado de Guardian Glass en Panamá. Vidrio arquitectónico de alta calidad.",
  },
];

/**
 * Vitro Rojas profile suppliers (production data)
 */
const vitroRojasProfileSuppliers: SeedPreset["profileSuppliers"] = [
  {
    name: "Aluminios Técnicos S.A.",
    materialType: "ALUMINUM",
    isActive: true,
    notes:
      "Proveedor principal de perfiles de aluminio para proyectos arquitectónicos.",
  },
  {
    name: "PVC Solutions Panamá",
    materialType: "PVC",
    isActive: true,
    notes: "Perfiles PVC de alta calidad para ventanas y puertas.",
  },
];

/**
 * Vitro Rojas Panama preset configuration
 */
export const vitroRojasPanamaPreset: SeedPreset = {
  name: "vitro-rojas-panama",
  description: "Production configuration for Vitro Rojas Panama client",
  profileSuppliers: vitroRojasProfileSuppliers,
  glassSuppliers: vitroRojasGlassSuppliers,
};
