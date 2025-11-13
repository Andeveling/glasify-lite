/**
 * Vitro Rojas - Profile Suppliers
 *
 * Data source: Extralum Panama documentation
 * - Sistema Corredizo VC Panamá
 * - Sistema Abatible Europa
 * - Sistema Corredizo Europa Clásica
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { NewProfileSupplier } from "@/server/db/schemas/profile-supplier.schema";

/**
 * Extralum - Único proveedor de perfiles de aluminio para Vitro Rojas
 *
 * Productos:
 * - Serie VC Panamá (espesores 1.10-1.52mm)
 * - Serie Europa Clásica (espesores 1.10-1.70mm)
 * - Serie Europa Abatible (espesores 1.10-1.50mm)
 */
export const vitroRojasProfileSuppliers: NewProfileSupplier[] = [
  {
    name: "Aluminios Técnicos S.A.",
    materialType: "ALUMINUM",
    isActive: "true",
    notes:
      "Distribuidor de perfiles de aluminio en Panamá. Series: VC Panamá (corredizo económico), Europa Clásica (corredizo premium 3 vías), Europa Abatible (apertura interna/externa con corte 45°).",
  },
  {
    name: "PVC Solutions Panamá",
    materialType: "PVC",
    isActive: "true",
    notes:
      "Proveedor de perfiles de PVC para sistemas de ventanas. Especializado en sistemas corredizos y abatibles con aislamiento térmico mejorado.",
  },
];
