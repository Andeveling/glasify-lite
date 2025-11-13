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
    notes:
      "Proveedor local de vidrio en Panamá. Especializado en vidrio templado y laminado para construcción.",
  },
  {
    name: "Guardian Glass Panamá",
    notes:
      "Distribuidor autorizado Guardian Glass. Proveedor de vidrio flotado, templado, laminado y DVH para proyectos comerciales y residenciales.",
  },
];
