/**
 * Vitro Rojas - Glass Suppliers
 *
 * Proveedores de vidrio del mercado panameño
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { NewGlassSupplier } from "@/server/db/schemas/glass-supplier.schema";

/**
 * Proveedores de vidrio en Panamá
 *
 * Nota: Estos son proveedores genéricos para mercado panameño.
 * Vitro Rojas puede actualizar según sus proveedores reales.
 */
export const vitroRojasGlassSuppliers: NewGlassSupplier[] = [
  {
    name: "Vidriera Nacional S.A.",
    code: "VNAT",
    country: "Panamá",
    contactEmail: "info@vidreranacional.com.pa",
    contactPhone: "+507 236-1234",
    website: "https://www.vidreranacional.com.pa",
    notes:
      "Proveedor local de vidrio en Panamá. Especializado en vidrio templado y laminado para construcción.",
    isActive: "true",
    tenantConfigId: "1",
  },
  {
    name: "Guardian Glass Panamá",
    code: "GGPA",
    country: "Panamá",
    contactEmail: "ventas@guardianglass.com.pa",
    contactPhone: "+507 270-5000",
    website: "https://www.guardianglass.com.pa",
    notes:
      "Distribuidor autorizado Guardian Glass. Proveedor de vidrio flotado, templado, laminado y DVH para proyectos comerciales y residenciales.",
    isActive: "true",
    tenantConfigId: "1",
  },
];
