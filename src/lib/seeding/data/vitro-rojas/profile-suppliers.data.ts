/**
 * Vitro Rojas - Profile Suppliers Data
 *
 * Proveedores de perfiles de aluminio para ventanas y puertas.
 * Incluye los principales fabricantes que trabajan con Vitro Rojas en Panamá.
 *
 * Material Types:
 * - ALUMINUM: Perfiles de aluminio (más común)
 * - PVC: Perfiles de PVC
 * - WOOD: Perfiles de madera
 * - MIXED: Sistemas mixtos (ej. aluminio-madera)
 *
 * @version 1.0.0
 * @date 2025-11-13
 */

export const vitroRojasProfileSuppliers = [
  {
    name: "Aluminios Panamá S.A.",
    materialType: "ALUMINUM" as const,
    isActive: true,
    notes:
      "Proveedor principal de perfiles de aluminio. Distribuidor autorizado de sistemas europeos.",
  },
  {
    name: "Perfiles del Istmo",
    materialType: "ALUMINUM" as const,
    isActive: true,
    notes:
      "Especializado en sistemas de aluminio arquitectónico. Productos de alta gama.",
  },
  {
    name: "Alumicorp Panamá",
    materialType: "ALUMINUM" as const,
    isActive: true,
    notes: "Perfiles de aluminio estándar y económicos. Buen stock local.",
  },
  {
    name: "Ventanas PVC Premium",
    materialType: "PVC" as const,
    isActive: true,
    notes: "Especialista en sistemas de PVC para clima tropical.",
  },
  {
    name: "Maderas Finas del Darién",
    materialType: "WOOD" as const,
    isActive: false,
    notes:
      "Perfiles de madera tropical. Uso limitado por mantenimiento en clima húmedo.",
  },
  {
    name: "Sistemas Mixtos Elite",
    materialType: "MIXED" as const,
    isActive: true,
    notes: "Sistemas híbridos aluminio-madera para proyectos premium.",
  },
];
